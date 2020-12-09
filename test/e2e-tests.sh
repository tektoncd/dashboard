#!/usr/bin/env bash

# Copyright 2018-2020 The Tekton Authors
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

initOS() {
  local OS=$(echo `uname`|tr '[:upper:]' '[:lower:]')

  case "$OS" in
    darwin*) SED='gsed';;
  esac
}

if [ -z "$LOCAL_RUN" ]; then
  initialize $@
  export REGISTRY="gcr.io/${E2E_PROJECT_ID}/${E2E_BASE_NAME}-e2e-img"
else
  export REGISTRY="registry.default.svc.cluster.local:5000/e2e-img"
  END=50
fi

initOS
install_kustomize
npm install -g newman@5.1.1

test_dashboard() {
  # kubectl or proxy (to create the necessary resources)
  local creationMethod=$1

  header "Setting up environment (${@:2})"
  $tekton_repo_dir/scripts/installer install ${@:2}
  wait_dashboard_backend
  header "Running the e2e tests (${@:2})"

  echo "Ensuring namespace $TEST_NAMESPACE exists"
  kubectl create ns $TEST_NAMESPACE > /dev/null 2>&1 || true

  # Port forward the dashboard
  kubectl port-forward $(kubectl get pod --namespace $DASHBOARD_NAMESPACE -l app=tekton-dashboard -o name)  --namespace $DASHBOARD_NAMESPACE 9097:9097 &
  dashboardForwardPID=$!

  # Wait until dashboard is found
  dashboardExists=false
  for i in $(eval echo "{$START..$END}")
  do
    respF=$(curl -k  http://127.0.0.1:9097)
    if [ "$respF" != "" ]; then
      dashboardExists=true
      break
    else
      sleep 5
    fi
  done

  if [ "$dashboardExists" = "false" ]; then
    fail_test "Test failure, not able to curl the Dashboard"
  fi

  # API/resource configuration
  export APP_SERVICE_ACCOUNT="e2e-tests"
  export PIPELINE_NAME="simple-pipeline-insecure"
  export IMAGE_RESOURCE_NAME="docker-image"
  export GIT_RESOURCE_NAME="git-source"
  export GIT_COMMIT="master"
  export REPO_NAME="go-hello-world"
  export REPO_URL="https://github.com/a-roberts/go-hello-world"
  export EXPECTED_RETURN_VALUE="Hello World!"
  export TEKTON_PROXY_URL="http://localhost:9097/proxy/apis/tekton.dev/v1alpha1/namespaces/$TEST_NAMESPACE"
  export CSRF_HEADERS_STORE="csrf_headers.txt"

  # Kubectl static resources
  echo "Creating static resources using kubectl..."
  staticFiles=($(find ${tekton_repo_dir}/test/resources/static -iname "*.y?ml"))
  for file in ${staticFiles[@]};do
    cat "${file}" | envsubst | kubectl apply --namespace $TEST_NAMESPACE -f - || fail_test "Failed to create static resource: ${file}"
  done

  curl -D $CSRF_HEADERS_STORE http://localhost:9097/v1/token
  export CSRF_TOKEN=`grep -i 'X-CSRF-Token' $CSRF_HEADERS_STORE | $SED -e 's/^X-CSRF-Token: //i;s/\r//'`
  export CSRF_COOKIE=`grep -i 'Set-Cookie' $CSRF_HEADERS_STORE | $SED -e 's/Set-Cookie: //i;s/; .*//;s/\r//'`

  if [ "$creationMethod" = "kubectl" ]; then
    # Kubectl envsubst resources
    echo "Creating resources using kubectl..."
    pipelineResourceFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelineresource*.y?ml"))
    for file in ${pipelineResourceFiles[@]};do
      cat "${file}" | envsubst | kubectl apply --namespace $TEST_NAMESPACE -f - || fail_test "Failed to create pipelineresource: ${file}"
    done

    pipelineRunFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelinerun*.y?ml"))
    for file in ${pipelineRunFiles[@]};do
      cat "${file}" | envsubst | kubectl apply --namespace $TEST_NAMESPACE -f - || fail_test "Failed to create pipelinerun: ${file}"
    done
  elif [ "$creationMethod" = "proxy" ]; then
    # Create envsubst resources through dashboard proxy
    echo "Creating resources using the dashboard proxy..."
    pipelineResourceFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelineresource*.y?ml"))
    for file in ${pipelineResourceFiles[@]};do
      json_curl_envsubst_resource "${file}" "POST" "${TEKTON_PROXY_URL}/pipelineresources" || fail_test "Failed to create pipelineresource: ${file}"
    done

    pipelineRunFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelinerun*.y?ml"))
    for file in ${pipelineRunFiles[@]};do
      json_curl_envsubst_resource "${file}" "POST" "${TEKTON_PROXY_URL}/pipelineruns" || fail_test "Failed to create pipelinerun: ${file}"
    done
  else
    fail_test "Unknown resources creation method: ${creationMethod}"
  fi

  print_diagnostic_info
  # Wait for deployment
  echo "About to check the deployment..."
  deploymentExist=false
  for i in $(eval echo "{$START..$END}")
  do
    wait=$(kubectl wait --namespace $TEST_NAMESPACE --for=condition=available deployments/go-hello-world --timeout=30s)
    if [ "$wait" = "deployment.apps/go-hello-world condition met" ]; then
      deploymentExist=true
      break
    elif [ "$wait" = "deployment.extensions/go-hello-world condition met" ]; then
      deploymentExist=true
      break
    else
      echo "Sleeping 5 seconds before retry..."
      sleep 5
    fi
  done

  if [ "$deploymentExist" = "false" ]; then
    echo "Here's the failed pod info"
    kubectl get pod --namespace $TEST_NAMESPACE -l app=go-hello-world -o name -o yaml
    kubectl describe pod --namespace $TEST_NAMESPACE -l app=go-hello-world
    fail_test "Test Failure, go-hello-world deployment is not running, see above for the PV and pod information"
  fi

  # Ping deployment
  kubectl port-forward $(kubectl get pod  --namespace $TEST_NAMESPACE -l app=go-hello-world -o name) --namespace $TEST_NAMESPACE 8080 &
  podForwardPID=$!

  podCurled=false
  for i in {1..20}
  do
    resp=$(curl -k  http://127.0.0.1:8080)
    if [ "$resp" != "" ]; then
      echo "Response from pod is: $resp"
      podCurled=true
      if [[ "$resp" = *${EXPECTED_RETURN_VALUE}* ]]; then
        echo "PipelineRun successfully executed"
        break
      else
        fail_test "PipelineRun error, returned an incorrect message: $resp"
      fi
    else
      sleep 5
    fi
  done

  if [ "$podCurled" = "false" ]; then
    fail_test "Test Failure, Not able to curl the pod"
  fi

  echo "Running postman collections..."

  local readonly=false

  if [ "$creationMethod" = "kubectl" ]; then
    readonly=true
  fi

  newman run ${tekton_repo_dir}/test/postman/Dashboard.postman_collection.json \
    -g ${tekton_repo_dir}/test/postman/globals.json \
    --global-var dashboard_namespace=$DASHBOARD_NAMESPACE \
    --global-var tenant_namespace=$TENANT_NAMESPACE \
    --global-var pipelines_version=$PIPELINES_VERSION \
    --global-var triggers_version=$TRIGGERS_VERSION \
    --global-var readonly=$readonly || fail_test "Postman Dashboard collection tests failed"

  newman run ${tekton_repo_dir}/test/postman/Pipelines.postman_collection.json \
    -g ${tekton_repo_dir}/test/postman/globals.json \
    --global-var dashboard_namespace=$DASHBOARD_NAMESPACE \
    --global-var tenant_namespace=$TENANT_NAMESPACE \
    --global-var pipelines_version=$PIPELINES_VERSION \
    --global-var triggers_version=$TRIGGERS_VERSION \
    --global-var readonly=$readonly || fail_test "Postman Pipelines collection tests failed"

  newman run ${tekton_repo_dir}/test/postman/Triggers.postman_collection.json \
    -g ${tekton_repo_dir}/test/postman/globals.json \
    --global-var dashboard_namespace=$DASHBOARD_NAMESPACE \
    --global-var tenant_namespace=$TENANT_NAMESPACE \
    --global-var pipelines_version=$PIPELINES_VERSION \
    --global-var triggers_version=$TRIGGERS_VERSION \
    --global-var readonly=$readonly || fail_test "Postman Triggers collection tests failed"

  kill -9 $dashboardForwardPID
  kill -9 $podForwardPID

  $tekton_repo_dir/scripts/installer uninstall ${@:2}

  echo "Deleting namespace $TEST_NAMESPACE"
  kubectl delete ns $TEST_NAMESPACE
}

header "Validating that we can build the release manifests"
echo "Building manifests for k8s"
$tekton_repo_dir/scripts/installer build                          || fail_test "Failed to build manifests for k8s"
echo "Building manifests for k8s --read-only"
$tekton_repo_dir/scripts/installer build --read-only              || fail_test "Failed to build manifests for k8s --read-only"
echo "Building manifests for openshift"
$tekton_repo_dir/scripts/installer build --openshift              || fail_test "Failed to build manifests for openshift"
echo "Building manifests for openshift --read-only"
$tekton_repo_dir/scripts/installer build --openshift --read-only  || fail_test "Failed to build manifests for openshift --read-only"

if [ -z "$PIPELINES_VERSION" ]; then
  export PIPELINES_VERSION=v0.19.0
fi

if [ -z "$TRIGGERS_VERSION" ]; then
  export TRIGGERS_VERSION=v0.10.1
fi

header "Installing Pipelines and Triggers"
install_pipelines $PIPELINES_VERSION
install_triggers $TRIGGERS_VERSION

header "Test Dashboard default namespace"
export DASHBOARD_NAMESPACE=tekton-pipelines
export TEST_NAMESPACE=tekton-test
export TENANT_NAMESPACE=""

test_dashboard proxy
test_dashboard kubectl --read-only

header "Test Dashboard custom namespace"
export DASHBOARD_NAMESPACE=tekton-dashboard
export TEST_NAMESPACE=tekton-test
export TENANT_NAMESPACE=""

test_dashboard proxy --namespace $DASHBOARD_NAMESPACE
test_dashboard kubectl --read-only --namespace $DASHBOARD_NAMESPACE

# TODO: this feature is incomplete, re-enable tests when ready
# header "Test Dashboard single namespace visibility"
# export DASHBOARD_NAMESPACE=tekton-dashboard
# export TEST_NAMESPACE=tekton-tenant
# export TENANT_NAMESPACE=tekton-tenant

# test_dashboard proxy --namespace $DASHBOARD_NAMESPACE --tenant-namespace $TENANT_NAMESPACE
# test_dashboard kubectl --read-only --namespace $DASHBOARD_NAMESPACE --tenant-namespace $TENANT_NAMESPACE

success
