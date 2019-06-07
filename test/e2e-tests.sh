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
export KNATIVE_VERSION="v0.5.0"

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
    timeout ${timeout_period} "kubectl get pods -n ${namespace} && [[ \$(kubectl get pods -n ${namespace} 2>&1 | grep -c -v -E '(Running|Completed|Terminating|STATUS)') -eq 0 ]]"
}


kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097 &
echo "dashboard forwarded to port 9097"




kubectl apply -f $tekton_repo_dir/test/Task.yaml
echo "kubectl apply -f tekton_repo_dir/test/Task.yaml"


kubectl apply -f $tekton_repo_dir/test/Pipeline.yaml
echo "kubectl apply -f tekton_repo_dir/test/Pipeline.yaml"

#kubectl apply -f $tekton_repo_dir/test/PipelineRun.yaml
#echo "kubectl apply -f tekton_repo_dir/test/PipelineRun.yaml"


wait_until_pods_running default




#API configuration
APP_NS="default"
PIPELINE_NAME="hello-pipeline"
IMAGE_SOURCE_NAME="docker-image"
GIT_RESOURCE_NAME="git-source"
GIT_COMMIT="master"
REPO_NAME="go-hello-world"
REPO_URL="https://github.com/ncskier/go-hello-world" 
EXPECTED_RETURN_VALUE="Hello Go Sample v1!"
KSVC_NAME="go-hello-world"


post_data='{
        "pipelinename": "'${PIPELINE_NAME}'",
        "gitcommit": "'${GIT_COMMIT}'",
        "reponame": "'${REPO_NAME}'",
        "repourl": "'${REPO_URL}'",
        "registrylocation": "'${DOCKERHUB_USERNAME}'",
        "serviceaccount": "'default'"
    }'

curlNport="http://127.0.0.1:9097/v1/namespaces/default/pipelineruns/"
echo "curl nport :$curlNport"

echo "Curling original"
curl -X POST --header Content-Type:application/json -d "$post_data" $curlNport 
echo "Curled"

#sleep 1m
wait_until_pods_running default

kubectl get pods 


kubectl get pipelineruns

responsePipelineRun=$(curl -k "http://127.0.0.1:9097/v1/namespaces/default/pipelineruns")
echo "response is :"
echo "$responsePipelineRun"

#$(app=hello-pipeline-run-1-do-hello-world -o name)
echo "pod=$(kubectl get pod app=tekton-pipeline-run -o name) attempt"
pod=$(kubectl get pod app=tekton-app -o name)
#pod=$(kubectl get pod app=hello-pipeline-run-1-do-hello-world -o name)

resp=$(curl -k  http://127.0.0.1:9097/v1/namespaces/default/pod/$pod) #"Host: ${domain}" ${ip})

echo "resp is :$resp"


echo "pod=$(kubectl get pod -l app=tekton-pipeline-run -o name) attempt"
pod=$(kubectl get pod -l app=tekton-app -o name)
#pod=$(kubectl get pod app=hello-pipeline-run-1-do-hello-world -o name)

resp=$(curl -k  http://127.0.0.1:9097/v1/namespaces/default/pod/$pod) #"Host: ${domain}" ${ip})

echo "resp is :$resp"


echo "pod=$(kubectl get pod -l app=tekton-pipeline-run) attempt"
pod=$(kubectl get pod -l app=tekton-app)
#pod=$(kubectl get pod app=hello-pipeline-run-1-do-hello-world -o name)

resp=$(curl -k  http://127.0.0.1:9097/v1/namespaces/default/pod/$pod) #"Host: ${domain}" ${ip})

echo "resp is :$resp"


echo "pod=$(kubectl get pod -l app=tekton-pipeline-run)-n default attempt"
pod=$(kubectl get pod -l app=tekton-app -n default)
#pod=$(kubectl get pod app=hello-pipeline-run-1-do-hello-world -o name)

resp=$(curl -k  http://127.0.0.1:9097/v1/namespaces/default/pod/$pod) #"Host: ${domain}" ${ip})

echo "resp is :$resp"

#kubectl describe pod 
# if [ "$EXPECTED_RETURN_VALUE" = "$resp" ]; then
#     echo "Pipeline Run successfully executed"
# else
#     echo "Pipeline Run error returned not expected message: $resp"


# kill -9 $fork_pid
# echo "killed port_forward" 

(( failed )) && fail_test
success
