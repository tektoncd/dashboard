#!/usr/bin/env bash

# Copyright 2018 The Tekton Authors
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
install_dashboard_backend

#Run the integration tests
header "Running the e2e tests"

kubectl port-forward $(kubectl get pod --namespace tekton-pipelines -l app=tekton-dashboard -o name)  --namespace tekton-pipelines 9097:9097 &
dashboardForwardPID=$!

#Apply permissions to be able to curl endpoints
kubectl apply -f $tekton_repo_dir/test/kaniko-build-task.yaml  --namespace tekton-pipelines
kubectl apply -f $tekton_repo_dir/test/deploy-task-insecure.yaml  --namespace tekton-pipelines
kubectl apply -f $tekton_repo_dir/test/Pipeline.yaml  --namespace tekton-pipelines

#API configuration
APP_SERVICE_ACCOUNT="tekton-dashboard"
PIPELINE_NAME="simple-pipeline-insecure"
IMAGE_SOURCE_NAME="docker-image"
GIT_RESOURCE_NAME="git-source"
GIT_COMMIT="master"
REPO_NAME="go-hello-world"
REPO_URL="https://github.com/ncskier/go-hello-world"
EXPECTED_RETURN_VALUE="Hello World! "
KSVC_NAME="go-hello-world"
REGISTRY="gcr.io/${E2E_PROJECT_ID}/${E2E_BASE_NAME}-e2e-img"

post_data='{
  "pipelinename": "'${PIPELINE_NAME}'",
  "imageresourcename": "'${IMAGE_SOURCE_NAME}'",
  "gitresourcename": "'${GIT_RESOURCE_NAME}'",
  "gitcommit": "'${GIT_COMMIT}'",
  "reponame": "'${REPO_NAME}'",
  "repourl": "'${REPO_URL}'",
  "registrylocation": "'$REGISTRY'",
  "serviceaccount": "'${APP_SERVICE_ACCOUNT}'"
}'

#For loop to check 9097 exists
dashboardExists=false
for i in {1..20}
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

namespaceResponse=$(curl -X GET --header Content-Type:application/json http://localhost:9097/proxy/api/v1/namespaces)

echo $namespaceResponse

if [[ $namespaceResponse != *"NamespaceList"* ]]; then
  fail_test "Could not get namespaces from dashboard proxy"
fi

curlNodePort="http://127.0.0.1:9097/v1/namespaces/tekton-pipelines/pipelineruns/"
curl -X POST --header Content-Type:application/json -d "$post_data" $curlNodePort

print_diagnostic_info

echo "About to check the deployment..."
deploymentExist=false
for i in {1..30}
do
  wait=$(kubectl wait --namespace tekton-pipelines --for=condition=available deployments/go-hello-world --timeout=30s)
  if [ "$wait" = "deployment.extensions/go-hello-world condition met" ]; then
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
    sleep 5
  fi
done

if [ "$deploymentExist" = "false" ]; then
  echo "Here's the failed pod info"
  kubectl get pod --namespace tekton-pipelines -l app=go-hello-world -o name --namespace tekton-pipelines -o yaml
  kubectl describe pod --namespace tekton-pipelines -l app=go-hello-world --namespace tekton-pipelines
  fail_test "Test Failure, go-hello-world deployment is not running, see above for the PV and pod information" 
fi

kubectl port-forward $(kubectl get pod  --namespace tekton-pipelines -l app=go-hello-world -o name) --namespace tekton-pipelines 8080 &
podForwardPID=$!

podCurled=false
for i in {1..20}
do
  resp=$(curl -k  http://127.0.0.1:8080)
  if [ "$resp" != "" ]; then
		echo "Response from pod is: $resp"
    podCurled=true
    if [ "$EXPECTED_RETURN_VALUE" = "$resp" ]; then
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
