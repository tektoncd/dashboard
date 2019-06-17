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
#export KO_DOCKER_REPO=gcr.io/${E2E_PROJECT_ID}/${E2E_BASE_NAME}-e2e-img

source $(dirname $0)/e2e-common.sh

# Script entry point.

initialize $@

header "Setting up environment"

install_pipeline_crd
install_dashboard_backend

# failed=0

# Run the integration tests
 header "Running e2e tests"
# # TODO: run your test here !

#Apply permissions to be able to curl endpoints 
echo "Applying test-rbac,yaml"
kubectl apply -f $tekton_repo_dir/test/test-rbac.yaml
echo "Applied test-rbac.yaml"


function wait_for_ready_pods() {
  if [ -z "$1" ] || [ -z "$2" ]; then
      echo "Usage ERROR for function: wait_for_ready_pods [namespace] [timeout] <sleepTime>"
      [ -z "$1" ] && echo "Missing [namespace]"
      [ -z "$2" ] && echo "Missing [timeout]"
      exit 1
  fi
  namespace=$1
  timeout_period=$2
  timeout ${timeout_period} "kubectl get pods -n ${namespace} && [[ \$(kubectl get pods -n ${namespace} --no-headers 2>&1 | grep -c -v -E '(Running|Completed|Terminating)') -eq 0 ]]"
}

function timeout() {
  SECONDS=0; TIMEOUT=$1; shift
  until eval $*; do
    sleep 5
    [[ $SECONDS -gt $TIMEOUT ]] && echo "ERROR: Timed out" && exit 1
  done
}

kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097 &
echo "dashboard forwarded to port 9097"

kubectl apply -f $tekton_repo_dir/test/kaniko-build-task.yaml

kubectl apply -f $tekton_repo_dir/test/build-task-insecure.yaml

kubectl apply -f $tekton_repo_dir/test/deploy-task-insecure.yaml

kubectl apply -f $tekton_repo_dir/test/Pipeline.yaml


#API configuration
APP_NS="default"
PIPELINE_NAME="simple-pipeline-insecure"
IMAGE_SOURCE_NAME="docker-image"
GIT_RESOURCE_NAME="git-source"
GIT_COMMIT="master"
REPO_NAME="go-hello-world"
REPO_URL="https://github.com/ncskier/go-hello-world" 
EXPECTED_RETURN_VALUE="Hello World!"
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
        "serviceaccount": "'${APP_NS}'"
    }'

curlNport="http://127.0.0.1:9097/v1/namespaces/default/pipelineruns/"
echo "curl nport :$curlNport"

echo "Curling original"
curl -X POST --header Content-Type:application/json -d "$post_data" $curlNport 
echo "Curled"

sleep 10
sleep 1m
wait_for_ready_pods default 1000 30
#echo "Pods should be ready 1000 30"
wait_until_pods_running default

echo "Kubenetes wait test"
kubectl wait --for=condition=Ready pod/go-hello-world --timeout=60s

echo "Get pods is"
kubectl get pods 

kubectl get pipelineruns

echo "deployments are:"
kubectl get deployments 

echo "svc are:"
kubectl get svc 

kubectl port-forward $(kubectl get pod -l app=go-hello-world -o name) 8080 &
echo "pod forwarded to port 8080"

#timing issue here 
echo "localhost attempt"
for i in {1..10}
do
   echo "Number of time looped =$i"
   export resp=$(curl -k  http://127.0.0.1:8080)

   #if [ "$resp" != "" ]; then
   #     break
    #else    
    sleep 3  
done
#resp=$(curl -k  http://127.0.0.1:8080)

echo "resp is :$resp"
resp="${resp%%*( )}"
echo "resp remove trailing whitespace is :$resp"

if [ "$EXPECTED_RETURN_VALUE" = "$resp" ]; then
     echo "Pipeline Run successfully executed"
 else
     echo "Pipeline Run error returned not expected message: $resp"


# kill -9 $fork_pid
# echo "killed port_forward" 

(( failed )) && fail_test
success
