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

FROM node:10-alpine as nodeBuilder
USER root
WORKDIR /go/src/github.com/tektoncd/dashboard
COPY . .
RUN npm install
RUN npm run build

FROM golang:1.12-alpine as goBuilder
USER root
RUN apk add curl git
RUN curl -fsSL -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v0.5.0/dep-linux-amd64 && chmod +x /usr/local/bin/dep
WORKDIR /go/src/github.com/tektoncd/dashboard
COPY . .
RUN dep ensure -vendor-only
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tekton_dashboard_backend ./cmd/dashboard

FROM alpine@sha256:7df6db5aa61ae9480f52f0b3a06a140ab98d427f86d8d5de0bedab9b8df6b1c0
RUN addgroup -g 1000 kgroup && \
  adduser -G kgroup -u 1000 -D -S kuser
USER 1000

WORKDIR /go/src/github.com/tektoncd/dashboard
ENV WEB_RESOURCES_DIR=./web
COPY --from=nodeBuilder /go/src/github.com/tektoncd/dashboard/dist ./web
COPY --from=goBuilder /go/src/github.com/tektoncd/dashboard/tekton_dashboard_backend .

ENTRYPOINT ["./tekton_dashboard_backend"]
