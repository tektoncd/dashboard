#!/usr/bin/env bash

# Copyright 2022-2025 The Tekton Authors
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
K8S_VERSION="v1.32.x"

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
case ${K8S_VERSION} in
  v1.29.x)
    K8S_VERSION="1.29.14"
    KIND_IMAGE_SHA="sha256:8703bd94ee24e51b778d5556ae310c6c0fa67d761fae6379c8e0bb480e6fea29"
    KIND_IMAGE="kindest/node:${K8S_VERSION}@${KIND_IMAGE_SHA}"
    ;;
  v1.30.x)
    K8S_VERSION="1.30.10"
    KIND_IMAGE_SHA="sha256:4de75d0e82481ea846c0ed1de86328d821c1e6a6a91ac37bf804e5313670e507"
    KIND_IMAGE="kindest/node:${K8S_VERSION}@${KIND_IMAGE_SHA}"
    ;;
  v1.31.x)
    K8S_VERSION="1.31.6"
    KIND_IMAGE_SHA="sha256:28b7cbb993dfe093c76641a0c95807637213c9109b761f1d422c2400e22b8e87"
    KIND_IMAGE="kindest/node:${K8S_VERSION}@${KIND_IMAGE_SHA}"
    ;;
  v1.32.x)
    K8S_VERSION="1.32.2"
    KIND_IMAGE_SHA="sha256:f226345927d7e348497136874b6d207e0b32cc52154ad8323129352923a3142f"
    KIND_IMAGE="kindest/node:${K8S_VERSION}@${KIND_IMAGE_SHA}"
    ;;
  *) abort "Unsupported version: ${K8S_VERSION}" ;;
esac

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
