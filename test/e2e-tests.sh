#!/usr/bin/env bash

# Copyright 2018-2023 The Tekton Authors
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

# This script calls out to scripts in tektoncd/plumbing to setup a cluster
# and deploy Tekton Pipelines to it for running integration tests.

export tekton_repo_dir=$(git rev-parse --show-toplevel)
source $(dirname $0)/e2e-common.sh

# Script entry point.

SED="sed"
START=1
END=30
PLATFORM=${PLATFORM:+"--platform $PLATFORM"}

initOS() {
  local OS=$(echo `uname`|tr '[:upper:]' '[:lower:]')

  case "$OS" in
    darwin*) SED='gsed';;
  esac
}

if [ "${SKIP_INITIALIZE}" != "true" ]; then
  initialize $@
else
  END=50
fi

initOS
install_kustomize

test_dashboard() {
  # kubectl or proxy (to create the necessary resources)
  local creationMethod=$1

  local readonly=false
  if [[ "${@:2}" =~ "--read-only" ]]; then
    readonly=true
  fi
  header "Setting up environment (${@:2})"
  $tekton_repo_dir/scripts/installer install ${@:2}
  wait_dashboard_backend
  header "Running the e2e tests (${@:2})"

  echo "Ensuring namespace $TEST_NAMESPACE exists"
  kubectl create ns $TEST_NAMESPACE > /dev/null 2>&1 || true

  # Port forward the dashboard
  kubectl port-forward svc/tekton-dashboard --namespace $DASHBOARD_NAMESPACE 8000:9097 > /dev/null 2>&1 &
  dashboardForwardPID=$!

  # Wait until dashboard is found
  dashboardReady=false
  for i in $(eval echo "{$START..$END}")
  do
    resp=$(curl -k http://127.0.0.1:8000)
    if [ "$resp" != "" ]; then
      dashboardReady=true
      echo "Dashboard ready"
      break
    else
      echo "Sleeping 5 seconds before retry..."
      sleep 5
    fi
  done

  if [ "$dashboardReady" = "false" ]; then
    fail_test "Test failure, not able to curl the Dashboard"
  fi

  # API/resource configuration
  export PIPELINE_RUN_NAME="e2e-pipelinerun"
  export POD_LABEL="tekton.dev/pipelineRun=$PIPELINE_RUN_NAME"
  export EXPECTED_RETURN_VALUE="Hello World!"
  export TEKTON_PROXY_URL="http://localhost:8000/apis/tekton.dev/v1beta1/namespaces/$TEST_NAMESPACE"

  # Kubectl static resources
  echo "Creating static resources using kubectl..."
  staticFiles=($(find ${tekton_repo_dir}/test/resources/static -iname "*.yaml"))
  for file in ${staticFiles[@]};do
    cat "${file}" | envsubst | kubectl apply --namespace $TEST_NAMESPACE -f - || fail_test "Failed to create static resource: ${file}"
  done

  if [ "$creationMethod" = "kubectl" ]; then
    # Kubectl envsubst resources
    echo "Creating resources using kubectl..."
    pipelineRunFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelinerun*.yaml"))
    for file in ${pipelineRunFiles[@]};do
      cat "${file}" | envsubst | kubectl apply --namespace $TEST_NAMESPACE -f - || fail_test "Failed to create pipelinerun: ${file}"
    done
  elif [ "$creationMethod" = "proxy" ]; then
    # Create envsubst resources through dashboard proxy
    echo "Creating resources using the dashboard proxy..."
    pipelineRunFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelinerun*.yaml"))
    for file in ${pipelineRunFiles[@]};do
      curl_envsubst_resource "${file}" "POST" "${TEKTON_PROXY_URL}/pipelineruns" || fail_test "Failed to create pipelinerun: ${file}"
    done
  else
    fail_test "Unknown resources creation method: ${creationMethod}"
  fi

  print_diagnostic_info
  # Wait for PipelineRun
  echo "Checking results..."
  URL="${TEKTON_PROXY_URL}/pipelineruns/$PIPELINE_RUN_NAME"
  pipelineRunFound=false
  for i in {1..20}
  do
    # curl will exit with code 22 if not found
    curl -sS -f -H "Content-Type: application/json" $URL
    if [ "$?" = "0" ]; then
      pipelineRunFound=true
      echo "PipelineRun successfully retrieved"
      break
    else
      echo "Sleeping 5 seconds before retry..."
      sleep 5
    fi
  done

  if [ "$pipelineRunFound" = "false" ]; then
    fail_test "PipelineRun not found"
  fi

  echo "Waiting for run to complete..."
  runCompleted=false
  for i in $(eval echo "{$START..$END}")
  do
    wait=$(kubectl get pods --namespace $TEST_NAMESPACE -l $POD_LABEL -o 'jsonpath={..status.conditions[?(@.reason=="PodCompleted")]}')
    if [ "$wait" != "" ]; then
      runCompleted=true
      echo "Run completed"
      break
    else
      echo "Sleeping 5 seconds before retry..."
      sleep 5
    fi
  done

  if [ "$runCompleted" = "false" ]; then
    echo "Here's the failed pod info"
    kubectl get pod --namespace $TEST_NAMESPACE -l $POD_LABEL -o name -o yaml
    kubectl describe pod --namespace $TEST_NAMESPACE -l $POD_LABEL
    fail_test "Test Failure, TaskRun pod did not complete, see above for the PV and pod information"
  fi

  logs=$(kubectl logs --namespace $TEST_NAMESPACE -l $POD_LABEL)
  if [ "$logs" = "$EXPECTED_RETURN_VALUE" ]; then
    echo "PipelineRun successfully executed"
  else
    fail_test "PipelineRun error, returned an incorrect message: $logs"
  fi

  echo "Running browser E2E tests…"

  VIDEO_PATH=""
  CYPRESS_ENV=""
  if [ ! -z "$ARTIFACTS" ] && [ "$E2E_VIDEO" != "false" ]; then
    VIDEO_PATH=$ARTIFACTS/videos
    mkdir -p $VIDEO_PATH
    chmod -R 777 $VIDEO_PATH
    echo "Videos of failing tests will be stored at $VIDEO_PATH"
  else
    echo "Skipping recording videos"
    CYPRESS_ENV="-e CYPRESS_video=false"
  fi

  # In case of failure we'll upload videos of the failing tests
  # Our Cypress config will delete videos of passing tests before exiting
  CYPRESS_SPEC=""
  if $readonly; then
    CYPRESS_SPEC='-- --spec cypress/e2e/common/**/*'
  fi
  chmod 644 ~/.kube/config
  docker run --rm --network=host $CYPRESS_ENV -v ~/.kube/config:/home/node/.kube/config -v $VIDEO_PATH:/home/node/cypress/videos dashboard-e2e $CYPRESS_SPEC || fail_test "Browser E2E tests failed"
  # If we get here the tests passed, no need to upload artifacts
  if [ ! -z "$VIDEO_PATH" ]; then
    rm -rf $VIDEO_PATH
  fi
  kill -9 $dashboardForwardPID

  $tekton_repo_dir/scripts/installer uninstall ${@:2}

  echo "Deleting namespace $TEST_NAMESPACE"
  kubectl delete ns $TEST_NAMESPACE
}

if [ -z "$SKIP_BUILD_TEST" ]; then
	header "Validating that we can build the release manifests"
	echo "Building manifests for k8s"
	$tekton_repo_dir/scripts/installer release                          || fail_test "Failed to build manifests for k8s"
	echo "Building manifests for k8s --read-only"
	$tekton_repo_dir/scripts/installer release --read-only              || fail_test "Failed to build manifests for k8s --read-only"
	echo "Building manifests for openshift"
	$tekton_repo_dir/scripts/installer release --openshift              || fail_test "Failed to build manifests for openshift"
	echo "Building manifests for openshift --read-only"
	$tekton_repo_dir/scripts/installer release --openshift --read-only  || fail_test "Failed to build manifests for openshift --read-only"
fi

header "Building browser E2E image"
docker build -t dashboard-e2e packages/e2e

if [ -z "$PIPELINES_VERSION" ]; then
  export PIPELINES_VERSION=v0.43.0
fi

if [ -z "$TRIGGERS_VERSION" ]; then
  export TRIGGERS_VERSION=v0.22.0
fi

header "Installing Pipelines and Triggers"
install_pipelines $PIPELINES_VERSION
install_triggers $TRIGGERS_VERSION

header "Test Dashboard default namespace"
export DASHBOARD_NAMESPACE=tekton-pipelines
export TEST_NAMESPACE=tekton-test
export TENANT_NAMESPACE=""

test_dashboard proxy ${PLATFORM}
test_dashboard kubectl ${PLATFORM} --read-only

header "Test Dashboard custom namespace"
if [ -z "$TEST_CUSTOM_INSTALL_NAMESPACE" ]; then
  echo "Skipping test"
else
  export DASHBOARD_NAMESPACE=tekton-dashboard
  export TEST_NAMESPACE=tekton-test
  export TENANT_NAMESPACE=""

  test_dashboard proxy ${PLATFORM} --namespace $DASHBOARD_NAMESPACE
  test_dashboard kubectl ${PLATFORM} --read-only --namespace $DASHBOARD_NAMESPACE
fi

# TODO: this feature will be expanded to support multiple namespaces
header "Test Dashboard namespace visibility"
if [ -z "$TEST_NAMESPACE_VISIBILITY" ]; then
  echo "Skipping test"
else
  export DASHBOARD_NAMESPACE=tekton-dashboard
  export TEST_NAMESPACE=tekton-tenant
  export TENANT_NAMESPACE=tekton-tenant

  test_dashboard proxy --namespace $DASHBOARD_NAMESPACE --tenant-namespace $TENANT_NAMESPACE
  test_dashboard kubectl --read-only --namespace $DASHBOARD_NAMESPACE --tenant-namespace $TENANT_NAMESPACE
fi

success
