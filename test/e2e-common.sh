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

# Helper functions for E2E tests.

source $(dirname $0)/../vendor/github.com/tektoncd/plumbing/scripts/e2e-tests.sh

function print_diagnostic_info() {
  # Adam's debugging as hello world is always pending rn!
  echo "Printing PV information"
  kubectl get pv -n tekton-pipelines
  kubectl describe pv -n tekton-pipelines

  echo "Printing PVC information"
  kubectl get pvc -n tekton-pipelines
  kubectl describe pvc -n tekton-pipelines

  echo "Printing pod information"
  kubectl describe pods -n tekton-pipelines
  kubectl get pods -n tekton-pipelines -o yaml
}

function install_pipeline_crd() {
  echo ">> Deploying Tekton Pipelines"
  kubectl apply --filename https://github.com/tektoncd/pipeline/releases/download/v0.6.0/release.yaml || fail_test "Tekton pipeline installation failed" 

  # Make sure thateveything is cleaned up in the current namespace.
  for res in pipelineresources tasks pipelines taskruns pipelineruns; do
    kubectl delete --ignore-not-found=true ${res}.tekton.dev --all
  done

  # Wait for pods to be running in the namespaces we are deploying to
  wait_until_pods_running tekton-pipelines || fail_test "Tekton Pipeline did not come up"
}

# Called by `fail_test` (provided by `e2e-tests.sh`) to dump info on test failure
function dump_extra_cluster_state() {
  echo ">>> Pipeline controller log:"
  kubectl -n tekton-pipelines logs $(get_app_pod tekton-pipelines-controller tekton-pipelines)
  echo ">>> Pipeline webhook log:"
  kubectl -n tekton-pipelines logs $(get_app_pod tekton-pipelines-webhook tekton-pipelines)
  echo ">>> Dashboard backend log:"
  kubectl -n tekton-pipelines logs $(get_app_pod tekton-dashboard tekton-pipelines)
}

function install_dashboard_backend() {
  echo ">> Deploying the Dashboard backend"
  ko apply -f config/ || fail_test "Dashboard backend installation failed"
  # Wait for pods to be running in the namespaces we are deploying to
  wait_until_pods_running tekton-pipelines || fail_test "Dashboard backend did not come up"
}

function dump_cluster_state() {
  echo "***************************************"
  echo "***         E2E TEST FAILED         ***"
  echo "***    Start of information dump    ***"
  echo "***************************************"
  echo ">>> All resources:"
  kubectl get all --all-namespaces
  echo ">>> Services:"
  kubectl get services --all-namespaces
  echo ">>> Events:"
  kubectl get events --all-namespaces
  function_exists dump_extra_cluster_state && dump_extra_cluster_state
  echo "***************************************"
  echo "***         E2E TEST FAILED         ***"
  echo "***     End of information dump     ***"
  echo "***************************************"
}

function fail_test() {
  [[ -n $1 ]] && echo "ERROR: $1"
  dump_cluster_state
  exit 1
}
