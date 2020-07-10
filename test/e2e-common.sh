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

# Helper functions for E2E tests.

source $(dirname $0)/../vendor/github.com/tektoncd/plumbing/scripts/e2e-tests.sh

function print_diagnostic_info() {
  echo "Diagnostics:"
  resources=("pv" "pvc" "pods")
  for r in "${resources[@]}";do
    echo "Printing ${r} information"
    kubectl get ${r} -n tekton-pipelines
    kubectl describe ${r} -n tekton-pipelines
  done
}

function install_kustomize() {
  if ! type "kustomize" > /dev/null; then
    echo ">> Installing kustomize"
    tar=kustomize_v3.6.1_linux_amd64.tar.gz
    curl -s -O -L https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize/v3.6.1/$tar
    tar xzf ./$tar

    cp ./kustomize /usr/local/bin
  fi
}

function install_pipelines() {
  local version=$1

  echo ">> Deploying Tekton Pipelines ($version)"
  kubectl apply --filename "https://github.com/tektoncd/pipeline/releases/download/$version/release.yaml" || fail_test "Tekton Pipelines installation failed"

  # Make sure thateveything is cleaned up in the current namespace.
  for res in pipelineresources tasks pipelines taskruns pipelineruns; do
    kubectl delete --ignore-not-found=true ${res}.tekton.dev --all
  done

  # Wait for pods to be running in the namespaces we are deploying to
  wait_until_pods_running tekton-pipelines || fail_test "Tekton Pipelines did not come up"
}

function install_triggers() {
  local version=$1

  echo ">> Deploying Tekton Triggers ($version)"
  kubectl apply --filename "https://github.com/tektoncd/triggers/releases/download/$version/release.yaml" || fail_test "Tekton Triggers installation failed"

  # Wait for pods to be running in the namespaces we are deploying to
  wait_until_pods_running tekton-pipelines || fail_test "Tekton Triggers did not come up"
}

function uninstall_pipelines() {
  local version=$1
  
  echo ">> Deleting Tekton Pipelines ($version)"
  kubectl delete --filename "https://github.com/tektoncd/pipeline/releases/download/$version/release.yaml" || fail_test "Tekton Pipelines deletion failed"
}

function uninstall_triggers() {
  local version=$1
  
  echo ">> Deleting Tekton Triggers ($version)"
  kubectl delete --filename "https://github.com/tektoncd/triggers/releases/download/$version/release.yaml" || fail_test "Tekton Triggers deletion failed"
}

# Called by `fail_test` (provided by `e2e-tests.sh`) to dump info on test failure
function dump_extra_cluster_state() {
  echo ">>> Pipeline controller log:"
  kubectl -n tekton-pipelines logs $(get_app_pod tekton-pipelines-controller tekton-pipelines)
  echo ">>> Pipeline webhook log:"
  kubectl -n tekton-pipelines logs $(get_app_pod tekton-pipelines-webhook tekton-pipelines)
  echo ">>> Dashboard backend log:"
  kubectl -n $DASHBOARD_NAMESPACE logs $(get_app_pod tekton-dashboard $DASHBOARD_NAMESPACE)

  echo "Task info"
  kubectl -n tekton-pipelines get Task -o yaml

  echo "TaskRun info"
  kubectl -n tekton-pipelines get TaskRun -o yaml

  echo "PipelineRun info"
  kubectl -n tekton-pipelines get PipelineRun -o yaml

  echo "PipelineRun container info"
  kubectl -n tekton-pipelines logs -l app=e2e-pipelinerun --all-containers
}

function wait_dashboard_backend() {
  # Wait until deployment is running before checking pods, stops timing error
  for i in {1..30}
  do
    wait=$(kubectl wait --namespace $DASHBOARD_NAMESPACE --for=condition=available deployments/tekton-dashboard --timeout=30s)
    echo "WAIT RESULT: $wait"
    if [ "$wait" = "deployment.apps/tekton-dashboard condition met" ]; then
      break
    elif [ "$wait" = "deployment.extensions/tekton-dashboard condition met" ]; then
      break
    else
      sleep 5
    fi
  done
  # Wait for pods to be running in the namespaces we are deploying to
  wait_until_pods_running $DASHBOARD_NAMESPACE || fail_test "Dashboard backend did not come up"
}

function dump_cluster_state() {
  echo "***************************************"
  echo "***         E2E TEST FAILED         ***"
  echo "***    Start of information dump    ***"
  echo "***************************************"
  echo ">>> All resources:"
  kubectl get all --all-namespaces
  kubectl get tekton --all-namespaces
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

# $1 = File name
# $2 = HTTP Method
# $3 = Endpoint
# Assuming a yaml k8s resource file, do envsubst replacement as well as conversion into json. This payload is then curled as specified.
function json_curl_envsubst_resource() {
  if [ $# -ne 3 ];then
    echo "File/HTTP-Method/Endpoint not found."
    exit 1
  fi
  yq --version
  set -x
  cat "$1" | envsubst | yq r -j - | curl -sS -X "$2" --data-binary @- -H "Content-Type: application/json" "$3" -H "Cookie: $CSRF_COOKIE" -H "X-CSRF-Token: $CSRF_TOKEN"
  set +x
}

function fail_test() {
  [[ -n $1 ]] && echo "ERROR: $1"
  # dump_cluster_state
  exit 1
}
