#!/usr/bin/env bash

# Copyright 2020 The Tekton Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

CLUSTERNAME="dashboard-tests"

verifySupported() {
  local OS=$(echo `uname`|tr '[:upper:]' '[:lower:]')
  local SED="sed"

  if [ "$OS" == "darwin" ]; then
    SED="gsed"
  fi

  if ! type "kubectl" > /dev/null; then
    echo "kubectl is required"
    exit 1
  fi

  if ! type "kind" > /dev/null; then
    echo "kind is required"
    exit 1
  fi

  if ! type "helm" > /dev/null; then
    echo "helm is required"
    exit 1
  fi

  if ! type "ko" > /dev/null; then
    echo "ko is required"
    exit 1
  fi

  if ! type "kustomize" > /dev/null; then
    echo "kustomize is required"
    exit 1
  fi

  if ! type "$SED" > /dev/null; then
    echo "$SED is required"
    exit 1
  fi
}

fail_trap() {
  result=$?
  teardown
  exit $result
}

setup() {
  kind create cluster --name $CLUSTERNAME
  helm install --wait registry stable/docker-registry --set fullnameOverride=registry
}

run() {
  $(git rev-parse --show-toplevel)/test/e2e-tests.sh;
}

teardown() {
  kind delete cluster --name $CLUSTERNAME
}

trap "fail_trap" EXIT

export LOCAL_RUN="true"

verifySupported
setup
run
teardown
