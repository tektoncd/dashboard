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

FROM ghcr.io/tektoncd/dashboard/dashboard-e2e-base:node24.16.0-chrome149@sha256:7b14188ca8495e867834b3e5bee5fa7ac6d313230886293bf252ebe5ce64db9d

ENTRYPOINT ["npm", "run", "test:ci"]
CMD ["--", "--browser", "chrome"]

COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY cypress.config.js .
COPY cypress cypress/
