#!/usr/bin/env bash

# Copyright 2018-2024 The Tekton Authors
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
  if ! type "kustomize" > /dev/null 2>&1; then
    echo ">> Installing kustomize"
    tar=kustomize_v5.3.0_linux_amd64.tar.gz
    curl -s -O -L https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize/v5.3.0/$tar
    tar xzf ./$tar

    mv ./kustomize /usr/local/bin
    rm ./$tar
  fi
}

function install_buildx() {
  echo ">> Installing buildx plugin"
  mkdir -p ~/.docker/cli-plugins \
     && curl -fsSL https://github.com/docker/buildx/releases/download/v0.10.4/buildx-v0.10.4.linux-amd64 > ~/.docker/cli-plugins/docker-buildx \
     && chmod u+x ~/.docker/cli-plugins/docker-buildx
}

function install_pipelines() {
  local version=$1

  echo ">> Deploying Tekton Pipelines ($version)"
  kubectl apply --filename "https://github.com/tektoncd/pipeline/releases/download/$version/release.yaml" || fail_test "Tekton Pipelines installation failed"

  # Make sure that everything is cleaned up in the current namespace.
  for res in tasks pipelines taskruns pipelineruns; do
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

function wait_dashboard_backend() {
  local ready=false
  # Wait until deployment is running before checking pods, stops timing error
  for i in {1..30}
  do
    wait=$(kubectl wait --namespace $DASHBOARD_NAMESPACE --for=condition=available deployments/tekton-dashboard --timeout=30s)
    echo "WAIT RESULT: $wait"
    if [ "$wait" = "deployment.apps/tekton-dashboard condition met" ]; then
      ready=true
      break
    elif [ "$wait" = "deployment.extensions/tekton-dashboard condition met" ]; then
      ready=true
      break
    else
      sleep 5
    fi
  done
  if ! $ready; then
    fail_test "Dashboard deployment not found"
  fi
  # Wait for pods to be running in the namespaces we are deploying to
  wait_until_pods_running $DASHBOARD_NAMESPACE || fail_test "Dashboard backend did not come up"
}

function fail_test() {
  [[ -n $1 ]] && echo "ERROR: $1"
  exit 1
}
