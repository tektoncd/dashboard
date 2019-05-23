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

#Fork port forward, once starts running never stops running until killed
function port_forward() {
    kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097
}


#kubectl cluster-info
output=$(kubectl cluster-info)
echo "kubectl cluster-info : $output"

#Gets the cluster info in the style: https://localhost:6443
output1=$(kubectl cluster-info | head -n 1)
echo "kubectl cluster-info | head -n 1 : $output1"
edited=$(echo "$output1" | sed 's/.*running at \([^ ]*\).*/\1/')
echo "Edited is: $edited"

port_forward &
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


kubectl apply -f Task.yaml

tasks=$(kubectl get tasks)
echo "tasks running are: $tasks"

kill -9 $fork_pid
echo "killed port_forward"



(( failed )) && fail_test
success
