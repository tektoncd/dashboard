# Copyright 2019-2020 The Tekton Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:14-alpine as nodeBuilder
USER root
WORKDIR /go/src/github.com/tektoncd/dashboard
COPY . .
RUN npm install
RUN npm run bootstrap:ci
RUN npm run build

FROM golang:1.15 as goBuilder

# Pass --build-arg GOARCH=ppc64le when building with docker build to build for another arch
ARG GOARCH=amd64

USER root
WORKDIR /work
COPY . .
RUN GO111MODULE=on CGO_ENABLED=0 GOOS=linux GOARCH=$GOARCH go build -a -installsuffix cgo -o tekton_dashboard_backend ./cmd/dashboard

FROM alpine@sha256:7df6db5aa61ae9480f52f0b3a06a140ab98d427f86d8d5de0bedab9b8df6b1c0
RUN addgroup -g 1000 kgroup && \
  adduser -G kgroup -u 1000 -D -S kuser
USER 1000

WORKDIR /go/src/github.com/tektoncd/dashboard

COPY --from=nodeBuilder /go/src/github.com/tektoncd/dashboard/dist ./web
COPY --from=goBuilder /work/tekton_dashboard_backend .

ENTRYPOINT ["./tekton_dashboard_backend"]
