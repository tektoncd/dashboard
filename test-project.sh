#!/usr/bin/env bash

curl --request POST \
  --header "Content-Type: application/json" \
  --header 'X-GitHub-Event: push' \
  --data '{"head_commit":{"id":"master"},"repository":{"url":"https://github.com/eddycharly/tekton-ci"}}' \
  http://tekton-ci.127.0.0.1.nip.io
