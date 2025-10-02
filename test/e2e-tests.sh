#!/usr/bin/env bash

# Copyright 2018-2025 The Tekton Authors
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

START=1
END=30
PLATFORM=${PLATFORM:+"--platform $PLATFORM"}

if [ "${SKIP_INITIALIZE}" != "true" ]; then
  initialize $@
else
  END=50
fi

install_buildx
if [ "${USE_NIGHTLY_RELEASE}" != "true" ]; then
  install_kustomize
fi

test_dashboard() {
  local readonly=true
  if [[ "$@" =~ "--read-write" ]]; then
    readonly=false
  fi
  header "Setting up environment ($@)"
  if [ "${USE_NIGHTLY_RELEASE}" == "true" ]; then
    echo "Installing nightly release"
    $tekton_repo_dir/scripts/release-installer install --nightly latest $@ || fail_test "Failed installing nightly release"
  else
    echo "Installing from HEAD"
    $tekton_repo_dir/scripts/installer install $@ || fail_test "Failed installing from HEAD"
  fi

  wait_dashboard_backend
  header "Running the e2e tests ($@)"

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

  echo "Running browser E2E tests…"

  VIDEO_PATH=""
  VIDEO_VOLUME=""
  CYPRESS_ENV=""
  if [ ! -z "$ARTIFACTS" ] && [ "$E2E_VIDEO" != "false" ]; then
    VIDEO_PATH=$ARTIFACTS/videos
    VIDEO_VOLUME="-v $VIDEO_PATH:/home/node/cypress/videos"
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
  docker run --rm --network=host $CYPRESS_ENV -v ~/.kube/config:/home/node/.kube/config $VIDEO_VOLUME dashboard-e2e $CYPRESS_SPEC || fail_test "Browser E2E tests failed"
  # If we get here the tests passed, no need to upload artifacts
  if [ ! -z "$VIDEO_PATH" ]; then
    rm -rf $VIDEO_PATH
  fi
  kill -9 $dashboardForwardPID

  $tekton_repo_dir/scripts/installer uninstall $@
}

header "Building browser E2E image"
echo "Started at $(date)"
DOCKER_BUILDKIT=1 docker build -t dashboard-e2e packages/e2e || fail_test "Failed building browser E2E image"
echo "Finished at $(date)"

if [ -z "$PIPELINES_VERSION" ]; then
  export PIPELINES_VERSION=v1.5.0
fi

if [ -z "$TRIGGERS_VERSION" ]; then
  export TRIGGERS_VERSION=v0.33.0
fi

header "Installing Pipelines and Triggers"
install_pipelines $PIPELINES_VERSION
install_triggers $TRIGGERS_VERSION

header "Test Dashboard default namespace"
export DASHBOARD_NAMESPACE=tekton-pipelines
export TENANT_NAMESPACE=""

if [ -z "$DASHBOARD_MODE" ]; then
  echo "Running tests for both install modes"
  test_dashboard ${PLATFORM} --read-write
  test_dashboard ${PLATFORM}
fi

if [ "$DASHBOARD_MODE" = "read-write" ]; then
  test_dashboard ${PLATFORM} --read-write
fi
if [ "$DASHBOARD_MODE" = "read-only" ]; then
  test_dashboard ${PLATFORM}
fi

header "Test Dashboard custom namespace"
if [ -z "$TEST_CUSTOM_INSTALL_NAMESPACE" ]; then
  echo "Skipping test"
else
  export DASHBOARD_NAMESPACE=tekton-dashboard
  export TENANT_NAMESPACE=""

  test_dashboard ${PLATFORM} --read-write --namespace $DASHBOARD_NAMESPACE
  test_dashboard ${PLATFORM} --namespace $DASHBOARD_NAMESPACE
fi

# TODO: this feature will be expanded to support multiple namespaces
header "Test Dashboard namespace visibility"
if [ -z "$TEST_NAMESPACE_VISIBILITY" ]; then
  echo "Skipping test"
else
  export DASHBOARD_NAMESPACE=tekton-dashboard
  # TODO: override namespaces used by Cypress when we re-enable this test
  # export TEST_NAMESPACE=tekton-tenant
  export TENANT_NAMESPACE=tekton-tenant

  test_dashboard --read-write --namespace $DASHBOARD_NAMESPACE --tenant-namespaces $TENANT_NAMESPACE
  test_dashboard --namespace $DASHBOARD_NAMESPACE --tenant-namespaces $TENANT_NAMESPACE
fi

success
