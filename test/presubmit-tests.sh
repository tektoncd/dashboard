#!/usr/bin/env bash

# Copyright 2018 The Knative Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script runs the presubmit tests; it is started by prow for each PR.
# For convenience, it can also be executed manually.
# Running the script without parameters, or with the --all-tests
# flag, causes all tests to be executed, in the right order.
# Use the flags --build-tests, --unit-tests and --integration-tests
# to run a specific set of tests.

# Useful environment variables
[[ -n "${PROW_JOB_ID:-}" ]] && IS_PROW=1 || IS_PROW=0
readonly IS_PROW
readonly REPO_ROOT_DIR="$(git rev-parse --show-toplevel)"
readonly REPO_NAME="$(basename ${REPO_ROOT_DIR})"

# On a Prow job, redirect stderr to stdout so it's synchronously added to log
(( IS_PROW )) && exec 2>&1

# Extensions or file patterns that don't require presubmit tests.
readonly NO_PRESUBMIT_FILES=(\.png \.gitignore \.gitattributes ^OWNERS ^OWNERS_ALIASES ^AUTHORS)

# Flag if this is a presubmit run or not.
[[ IS_PROW && -n "${PULL_PULL_SHA}" ]] && IS_PRESUBMIT=1 || IS_PRESUBMIT=0
readonly IS_PRESUBMIT

# List of changed files on presubmit, LF separated.
CHANGED_FILES=""

# Flags that this PR is exempt of presubmit tests.
IS_PRESUBMIT_EXEMPT_PR=0

# Flags that this PR contains only changes to documentation.
IS_DOCUMENTATION_PR=0

# Display a pass/fail banner for a test group.
# Parameters: $1 - test group name (e.g., build)
#             $2 - result (0=passed, 1=failed)
function results_banner() {
  local result
  [[ $2 -eq 0 ]] && result="PASSED" || result="FAILED"
  header "$1 tests ${result}"
}

# Display a box banner.
# Parameters: $1 - character to use for the box.
#             $2 - banner message.
function make_banner() {
    local msg="$1$1$1$1 $2 $1$1$1$1"
    local border="${msg//[-0-9A-Za-z _.,\/()]/$1}"
    echo -e "${border}\n${msg}\n${border}"
}

# Simple header for logging purposes.
function header() {
  local upper="$(echo $1 | tr a-z A-Z)"
  make_banner "=" "${upper}"
}

# Simple subheader for logging purposes.
function subheader() {
  make_banner "-" "$1"
}

# List changed files in the current PR.
# This is implemented as a function so it can be mocked in unit tests.
function list_changed_files() {
  /workspace/githubhelper -list-changed-files
}

# Returns true if PR only contains the given file regexes.
# Parameters: $1 - file regexes, space separated.
function pr_only_contains() {
  [[ -z "$(echo "${CHANGED_FILES}" | grep -v \(${1// /\\|}\)$))" ]]
}

# Initialize flags and context for presubmit tests:
# CHANGED_FILES, IS_PRESUBMIT_EXEMPT_PR and IS_DOCUMENTATION_PR.
function initialize_environment() {
  CHANGED_FILES=""
  IS_PRESUBMIT_EXEMPT_PR=0
  IS_DOCUMENTATION_PR=0
  (( ! IS_PRESUBMIT )) && return
  CHANGED_FILES="$(list_changed_files)"
  if [[ -n "${CHANGED_FILES}" ]]; then
    echo -e "Changed files in commit ${PULL_PULL_SHA}:\n${CHANGED_FILES}"
    local no_presubmit_files="${NO_PRESUBMIT_FILES[*]}"
    pr_only_contains "${no_presubmit_files}" && IS_PRESUBMIT_EXEMPT_PR=1
    pr_only_contains "\.md ${no_presubmit_files}" && IS_DOCUMENTATION_PR=1
  else
    header "NO CHANGED FILES REPORTED, ASSUMING IT'S AN ERROR AND RUNNING TESTS ANYWAY"
  fi
  readonly CHANGED_FILES
  readonly IS_DOCUMENTATION_PR
  readonly IS_PRESUBMIT_EXEMPT_PR
}

# Run a go tool, installing it first if necessary.
# Parameters: $1 - tool package/dir for go get/install.
#             $2 - tool to run.
#             $3..$n - parameters passed to the tool.
function run_go_tool() {
  local tool=$2
  if [[ -z "$(which ${tool})" ]]; then
    local action=get
    [[ $1 =~ ^[\./].* ]] && action=install
    go ${action} $1
  fi
  shift 2
  ${tool} "$@"
}

# Runs a go test and generate a junit summary.
# Parameters: $1... - parameters to go test
function report_go_test() {
  # Run tests in verbose mode to capture details.
  # go doesn't like repeating -v, so remove if passed.
  local args=" $@ "
  local go_test="go test -race -v ${args/ -v / }"
  # Just run regular go tests if not on Prow.
  echo "Running tests with '${go_test}'"
  local report=$(mktemp)
  ${go_test} | tee ${report}
  local failed=( ${PIPESTATUS[@]} )
  [[ ${failed[0]} -eq 0 ]] && failed=${failed[1]} || failed=${failed[0]}
  echo "Finished run, return code is ${failed}"
  # Install go-junit-report if necessary.
  run_go_tool github.com/jstemmer/go-junit-report go-junit-report --help > /dev/null 2>&1
  local xml=$(mktemp ${ARTIFACTS}/junit_XXXXXXXX.xml)
  cat ${report} \
      | go-junit-report \
      | sed -e "s#\"github.com/knative/${REPO_NAME}/#\"#g" \
      > ${xml}
  echo "XML report written to ${xml}"
  if (( ! IS_PROW )); then
    # Keep the suffix, so files are related.
    local logfile=${xml/junit_/go_test_}
    logfile=${logfile/.xml/.log}
    cp ${report} ${logfile}
    echo "Test log written to ${logfile}"
  fi
  return ${failed}
}

# Run tests.
function run_tests() {
  (( ! RUN_TESTS )) && return 0
  header "Running tests"
  local failed=0
  #docker build -f ./Dockerfile_test . || failed = 1
  dep ensure -v || failed=1
  report_go_test ./pkg/... || failed=1
  results_banner "Build" ${failed}
  return ${failed}
}

# Process flags and run tests accordingly.
function main() {
  initialize_environment
  if (( IS_PRESUBMIT_EXEMPT_PR )) && (( ! IS_DOCUMENTATION_PR )); then
    header "Commit only contains changes that don't require tests, skipping"
    exit 0
  fi

  # Show the version of the tools we're using
  if (( IS_PROW )); then
    # Disable gcloud update notifications
    gcloud config set component_manager/disable_update_check true
    header "Current test setup"
    echo ">> gcloud SDK version"
    gcloud version
    echo ">> kubectl version"
    kubectl version --client
    echo ">> go version"
    go version
    echo ">> git version"
    git version
    echo ">> bazel version"
    bazel version 2> /dev/null
    if [[ "${DOCKER_IN_DOCKER_ENABLED}" == "true" ]]; then
      echo ">> docker version"
      docker version
    fi
  fi

  [[ -z $1 ]] && set -- "--all-tests"

  local TEST_TO_RUN=""

  while [[ $# -ne 0 ]]; do
    local parameter=$1
    case ${parameter} in
      --tests) RUN_TESTS=1 ;;
      --all-tests)
        RUN_TESTS=1
        ;;
      --run-test)
        shift
        [[ $# -ge 1 ]] || abort "missing executable after --run-test"
        TEST_TO_RUN=$1
        ;;
      *) abort "error: unknown option ${parameter}" ;;
    esac
    shift
  done

  readonly RUN_TESTS
  readonly TEST_TO_RUN

  cd ${REPO_ROOT_DIR}

  # Tests to be performed, in the right order if --all-tests is passed.

  local failed=0

  if [[ -n "${TEST_TO_RUN}" ]]; then
    if (( RUN_TESTS )); then
      abort "--run-test must be used alone"
    fi
    # If this is a presubmit run, but a documentation-only PR, don't run the test
    (( IS_PRESUBMIT && IS_DOCUMENTATION_PR )) && exit 0
    ${TEST_TO_RUN} || failed=1
  fi

  run_tests || failed=1

  exit ${failed}
}


main $@
