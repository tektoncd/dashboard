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
K8S_VERSION="v1.37.x"

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
  v1.34.x)
    K8S_VERSION="1.34.11"
    KIND_IMAGE_SHA="sha256:44e222ee2132dab25ff87301682f89eb82c7880ea3a1bf543bfe9708fd08d67d"
    ;;
  v1.35.x)
    K8S_VERSION="1.35.8"
    KIND_IMAGE_SHA="sha256:07b2536e30b803ed61d1677a79df6115f798ce64c80f9e22f6ed45afd09323c0"
    ;;
  v1.36.x)
    K8S_VERSION="1.36.4"
    KIND_IMAGE_SHA="099e049362a1526b2db71494e1947aae99bd16290d7c895f2b7ea312e3cbfaed"
    ;;
  v1.37.x)
    K8S_VERSION="1.37.0"
    KIND_IMAGE_SHA="sha256:a1ed56cfb0e7b93589bdf97c8cd566405a265939e3620fc4f5de89adff580ae5"
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
