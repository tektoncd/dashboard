#!/usr/bin/env bash

# Copyright 2022-2026 The Tekton Authors
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

# Defaults
K8S_VERSION="v1.35.x"

while [[ $# -ne 0 ]]; do
  parameter="$1"
  case "${parameter}" in
    --k8s-version)
      shift
      K8S_VERSION="$1"
      ;;
    *) abort "unknown option ${parameter}" ;;
  esac
  shift
done

# The version map correlated with this version of kind
# Image versions and SHAs can be found in the kind release notes
# https://github.com/kubernetes-sigs/kind/releases
case ${K8S_VERSION} in
  v1.31.x)
    K8S_VERSION="1.31.14"
    KIND_IMAGE_SHA="sha256:6f86cf509dbb42767b6e79debc3f2c32e4ee01386f0489b3b2be24b0a55aac2b"
    ;;
  v1.32.x)
    K8S_VERSION="1.32.11"
    KIND_IMAGE_SHA="sha256:5fc52d52a7b9574015299724bd68f183702956aa4a2116ae75a63cb574b35af8"
    ;;
  v1.33.x)
    K8S_VERSION="1.33.7"
    KIND_IMAGE_SHA="sha256:d26ef333bdb2cbe9862a0f7c3803ecc7b4303d8cea8e814b481b09949d353040"
    ;;
  v1.34.x)
    K8S_VERSION="1.34.3"
    KIND_IMAGE_SHA="sha256:08497ee19eace7b4b5348db5c6a1591d7752b164530a36f855cb0f2bdcbadd48"
    ;;
  v1.35.x)
    K8S_VERSION="1.35.0"
    KIND_IMAGE_SHA="sha256:452d707d4862f52530247495d180205e029056831160e22870e37e3f6c1ac31f"
    ;;
  *) abort "Unsupported version: ${K8S_VERSION}" ;;
esac

KIND_IMAGE="kindest/node:${K8S_VERSION}@${KIND_IMAGE_SHA}"

# Create kind config with correct k8s version
cat > kind-config.yaml <<EOF
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  image: "docker.io/${KIND_IMAGE}"
EOF

echo '::group::kind-config.yaml'
cat kind-config.yaml
echo '::endgroup::'

echo '::group::kind version'
kind --version
echo '::endgroup::'

echo '::group::check we can talk to docker'
docker ps
echo '::endgroup::'

echo '::group::create cluster'
kind create cluster --config kind-config.yaml
echo '::endgroup::'

# Run the tests
$(git rev-parse --show-toplevel)/test/presubmit-tests.sh --integration-tests;
