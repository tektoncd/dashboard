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

initialize $@

header "Setting up environment"

install_pipeline_crd
install_kustomize
install_dashboard_backend

header "Running the e2e tests"

# Port forward the dashboard
kubectl port-forward $(kubectl get pod --namespace tekton-pipelines -l app=tekton-dashboard -o name)  --namespace tekton-pipelines 9097:9097 &
dashboardForwardPID=$!

# Wait until dashboard is found
dashboardExists=false
for i in {1..20};do
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
export REPO_URL="https://github.com/ncskier/go-hello-world"
export EXPECTED_RETURN_VALUE="Hello World!"
export REGISTRY="gcr.io/${E2E_PROJECT_ID}/${E2E_BASE_NAME}-e2e-img"
export TEKTON_PROXY_URL="http://localhost:9097/proxy/apis/tekton.dev/v1alpha1/namespaces/tekton-pipelines"
export CSRF_HEADERS_STORE="csrf_headers.txt"

# Kubectl static resources
kubectl apply -f ${tekton_repo_dir}/test/resources/static

curl -D $CSRF_HEADERS_STORE http://localhost:9097/v1/token
export CSRF_TOKEN=`grep -i 'X-CSRF-Token' $CSRF_HEADERS_STORE | sed -e 's/^X-CSRF-Token: //i;s/\r//'`
export CSRF_COOKIE=`grep -i 'Set-Cookie' $CSRF_HEADERS_STORE | sed -e 's/Set-Cookie: //i;s/; .*//;s/\r//'`

# Create envsubst resources through dashboard proxy
pipelineResourceFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelineresource*.y?ml"))
for file in ${pipelineResourceFiles[@]};do
  json_curl_envsubst_resource "${file}" "POST" "${TEKTON_PROXY_URL}/pipelineresources" || fail_test "Failed to create pipelineresource: ${file}"
done

pipelineRunFiles=($(find ${tekton_repo_dir}/test/resources/envsubst -iname "pipelinerun*.y?ml"))
for file in ${pipelineRunFiles[@]};do
  json_curl_envsubst_resource "${file}" "POST" "${TEKTON_PROXY_URL}/pipelineruns" || fail_test "Failed to create pipelinerun: ${file}"
done

print_diagnostic_info
# Wait for deployment
echo "About to check the deployment..."
deploymentExist=false
for i in {1..30}
do
  wait=$(kubectl wait --namespace tekton-pipelines --for=condition=available deployments/go-hello-world --timeout=30s)
  echo "WAIT RESULT: $wait"
  if [ "$wait" = "deployment.apps/go-hello-world condition met" ]; then
    deploymentExist=true
    break
  elif [ "$wait" = "deployment.extensions/go-hello-world condition met" ]; then
    deploymentExist=true
    break
  else
    echo "About to sleep, getting and describing pod info"
    kubectl get pod --namespace tekton-pipelines -l app=go-hello-world -o name --namespace tekton-pipelines -o yaml
    kubectl describe pod --namespace tekton-pipelines -l app=go-hello-world --namespace tekton-pipelines
    kubectl get pods -n tekton-pipelines
    kubectl get deployments -n tekton-pipelines
    echo "Dashboard logs"
    kubectl logs -l app=tekton-dashboard -n tekton-pipelines
    echo "Pods in all namespaces"
    kubectl get pods --all-namespaces
    echo "Pipelineruns as json, all namespaces"
    kubectl get pipelineruns -o json --all-namespaces
    echo "TaskRun info"
    kubectl -n tekton-pipelines get TaskRun -o json
    echo "PipelineRun info"
    kubectl -n tekton-pipelines get PipelineRun -o json
    echo "PipelineRun container info"
    kubectl -n tekton-pipelines logs -l app=e2e-pipelinerun --all-containers
    sleep 5
  fi
done

if [ "$deploymentExist" = "false" ]; then
  echo "Here's the failed pod info"
  kubectl get pod --namespace tekton-pipelines -l app=go-hello-world -o name --namespace tekton-pipelines -o yaml
  kubectl describe pod --namespace tekton-pipelines -l app=go-hello-world --namespace tekton-pipelines
  fail_test "Test Failure, go-hello-world deployment is not running, see above for the PV and pod information"
fi

# Ping deployment
kubectl port-forward $(kubectl get pod  --namespace tekton-pipelines -l app=go-hello-world -o name) --namespace tekton-pipelines 8080 &
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

kill -9 $dashboardForwardPID
kill -9 $podForwardPID

success
