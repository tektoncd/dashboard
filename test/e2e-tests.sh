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

failed=0

# Run the integration tests
header "Running e2e tests"
# TODO: run your test here !

function install_istio() {
    if [ -z "$1" ]; then
        echo "Usage ERROR for function: install_istio [version]"
        echo "Missing [version]"
        exit 1
    fi
    version="$1"
    # Install on Minikube or Docker Desktop
    kubectl apply --filename https://github.com/knative/serving/releases/download/${version}/istio-crds.yaml &&
    curl -L https://github.com/knative/serving/releases/download/${version}/istio.yaml \
      | kubectl apply --filename -

    # This works but why are we only labelling the default namespace? 
    # Isn't this needed on those namespaces in which we use knative-eventing?
    # If not is Istio really required for our purposes? 
    kubectl label namespace default istio-injection=enabled

    # Wait until all the pods come up
    wait_for_ready_pods istio-system 300 30
}

function install_knative_serving() {
    if [ -z "$1" ]; then
        echo "Usage ERROR for function: install_knative_serving [version]"
        echo "Missing [version]"
        exit 1
    fi
    version="$1"
    curl -L https://github.com/knative/serving/releases/download/${version}/serving.yaml \
    | kubectl apply --filename -
    # Wait until all the pods come up
    wait_for_ready_pods knative-serving 180 20
}

function install_knative_eventing() {
    if [ -z "$1" ]; then
        echo "Usage ERROR for function: install_knative_eventing [version]"
        echo "Missing [version]"
        exit 1
    fi
    version="$1"
    kubectl apply --filename https://github.com/knative/eventing/releases/download/${version}/release.yaml
    # Wait until all the pods come up
    wait_for_ready_pods knative-eventing 180 20
}

# Note that eventing-sources.yaml was renamed from release.yaml in the v0.5.0 release, so this won't work for earlier releases as-is. 
function install_knative_eventing_sources() {
    if [ -z "$1" ]; then
        echo "Usage ERROR for function: install_knative_eventing_sources [version]"
        echo "Missing [version]"
        exit 1
    fi
    version="$1"
    kubectl apply --filename https://github.com/knative/eventing-sources/releases/download/${version}/eventing-sources.yaml
    # Wait until all the pods come up
    wait_for_ready_pods knative-sources 180 20
}

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



#Fork port forward, once starts running never stops running until killed
function port_forward() {
    kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097
}

echo "Installing knative version $KNATIVE_VERSION"
install_istio $KNATIVE_VERSION
install_knative_serving $KNATIVE_VERSION
install_knative_eventing $KNATIVE_VERSION
install_knative_eventing_sources $KNATIVE_VERSION
echo "Installed knative version $KNATIVE_VERSION"


#kubectl cluster-info
output=$(kubectl cluster-info)
echo "kubectl cluster-info : $output"

#Gets the cluster info in the style: https://localhost:6443
output1=$(kubectl cluster-info | head -n 1)
echo "kubectl cluster-info | head -n 1 : $output1"
edited=$(echo "$output1" | sed 's/.*://') #sed 's/.*running at \([^ ]*\).*/\1/')
#edited1=$(echo "$output1" | sed 's/.*https://\([^ ]*\).*/\1/')
#echo "Edited1 is $edited1"
#edited=$(echo "$edited1 | sed 's/ .*//'") #cut -f1 -d" "")
echo "Edited is: $edited"

edited1=$(echo "$edited" | sed 's/.\{4\}$//')  
#| sed s'/[a-zA-Z]$//') #sed 's/.*https: \([^ ]*\).*/\1/')
echo "Edited1 is: $edited1"

ip="https:$edited1"
echo "ip is $ip"

#edited2=$(echo "$edited" | sed 's/ .*//')
#echo "Edited2 is: $edited2"

kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097 &
#port_forward &
echo "dashboard forwarded to port 9097"
fork_pid=$!
echo "fork_pid = $fork_pid"

pods=$(kubectl get pods)
echo "Pods running are: $pods"

deployments=$(kubectl get deployments)
echo "Deployments running are: $deployments"

pipeline=$(kubectl get pipeline)
echo "pipeline running are: $pipeline"

pipelineresource=$(kubectl get pipelineresource)
echo "pipelineresource running are: $pipelineresource"

pipelinerun=$(kubectl get pipelinerun)
echo "pipelinerun running are: $pipelinerun"

tasks=$(kubectl get tasks)
echo "tasks running are: $tasks"

echo "$tekton_repo_dir"

kubectl apply -f $tekton_repo_dir/test/Task.yaml
echo "kubectl apply -f tekton_repo_dir/test/Task.yaml"

#kubectl apply -f $tekton_repo_dir/test/TaskHelloWorld.yaml
#echo "kubectl apply -f tekton_repo_dir/test/TaskHelloWorld.yaml"

tasks=$(kubectl get tasks)
echo "tasks running are: "
echo "$tasks"

kubectl apply -f $tekton_repo_dir/test/Pipeline.yaml
echo "kubectl apply -f tekton_repo_dir/test/Pipeline.yaml"

pipeline=$(kubectl get pipeline)
echo "pipeline running are: "
echo "$pipeline"

kubectl apply -f $tekton_repo_dir/test/PipelineRun.yaml
echo "kubectl apply -f tekton_repo_dir/test/PipelineRun.yaml"

pipelinerun=$(kubectl get pipelinerun)
echo "pipelinerun running are:"
echo "$pipelinerun"

wait_until_pods_running default

pods=$(kubectl get pods)
echo "Pods running are: "
echo "$pods"

deployments=$(kubectl get deployments)
echo "Deployments running are: "
echo "$deployments"

ksvc=$(kubectl get ksvc)
echo "KSVC are:"
echo "$ksvc"

ssvc=$(kubectl get svc)
echo "SVC are:"
echo "$svc"

#curling=$(curl -k $ip)
#echo "ip =$ip"
#echo "curling"

#echo "response pipelne is : $ip:9097/v1/namespaces/default/pipelines"

#responsePipeline=$(curl -k "$ip:9097/v1/namespaces/default/pipelines")
#echo "response is :"
#echo "$responsePipeline"  

#responsePipelineRun=$(curl -k "$ip:9097/v1/namespaces/default/pipelineruns")
#echo "response is :"
#echo "$responsePipelineRun"  

#responseTask=$(curl -k "$ip:9097/v1/namespaces/default/tasks")
#echo "response is :"
#echo "$responseTask" 

#USER=$(gcloud config get-value core/account)
# Make that user a cluster admin
#kubectl edit clusterrolebinding cluster-admin-binding \
#  --clusterrole=cluster-admin \
#  --user="${USER}"

namespaces=$(kubectl get namespaces)
echo "namespaces are:"
echo "$namespaces"

responseLocal=$(curl -k "127.0.0.1:9097/v1/namespaces/default/pipelines")
echo "response is :"
echo "$responseLocal" 

responseLocal1=$(curl -k "127.0.0.1:9097/v1/namespaces/default/pipelineruns")
echo "response is :"
echo "$responseLocal1"  

responseLocal2=$(curl -k "127.0.0.1:9097/v1/namespaces/default/tasks")
echo "response is :"
echo "$responseLocal2" 


kill -9 $fork_pid
echo "killed port_forward" 

(( failed )) && fail_test
success
