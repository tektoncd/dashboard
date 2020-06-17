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

# This script runs at the postsubmit phase; it is started by prow when a push event
# happens on master, via a PR merge for example.

set -e

# It's Stretch and https://github.com/tektoncd/dashboard/blob/master/package.json
# denotes the Node.js and npm versions
apt-get update
apt-get install -y curl
curl -O https://nodejs.org/dist/v12.18.0/node-v12.18.0-linux-x64.tar.xz
tar xf node-v12.18.0-linux-x64.tar.xz
export PATH=$PATH:$(pwd)/node-v12.18.0-linux-x64/bin

mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=$PATH:$HOME/.npm-global/bin
npm ci
npm run bootstrap:ci
npm run build_ko

export KO_DOCKER_REPO=gcr.io/tekton-nightly

# Publish the image
IMAGE=$(ko publish ./cmd/dashboard 2>&1 | grep "Published ${KO_DOCKER_REPO}/dashboard" | sed -n -r '/[0-9]+\/[0-9]+\/[0-9]+ [0-9]+:[0-9]+:[0-9]+.*Published/ { s/.*Published //;p}')

# Tag it
gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}
gcloud -q container images add-tag ${IMAGE} ${KO_DOCKER_REPO}/dashboard:latest
