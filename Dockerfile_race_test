# Copyright 2019 The Tekton Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Differs from alpine image used in main Dockerfile as we want to go test -race too
FROM golang:1.12-stretch
USER root

RUN apt-get install curl git

RUN curl -fsSL -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v0.5.0/dep-linux-amd64 && chmod +x /usr/local/bin/dep
WORKDIR /go/src/github.com/tektoncd/dashboard/
COPY . .
RUN dep ensure -vendor-only
WORKDIR /go/src/github.com/tektoncd/dashboard/pkg/endpoints
ENV WEB_RESOURCES_DIR=/go/src/github.com/tektoncd/dashboard/testdata/web/

# CGO_ENABLED=1 is needed for -race on go test
RUN CGO_ENABLED=1 NAMESPACE=default GOOS=linux go test -race -v
