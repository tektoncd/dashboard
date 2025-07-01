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

FROM ghcr.io/tektoncd/dashboard/dashboard-e2e-base:node20.19.3-chrome138@sha256:6ca889424f0e60dd622d4bf54d04d3fc46606ef7bea68f1faf1d89d9ef943bd2

ENTRYPOINT ["npm", "run", "test:ci"]
CMD ["--", "--browser", "chrome"]

COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY cypress.config.js .
COPY cypress cypress/
