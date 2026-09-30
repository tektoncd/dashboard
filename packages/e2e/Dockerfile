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

FROM ghcr.io/tektoncd/dashboard/dashboard-e2e-base:node24.21.0-chrome153@sha256:529145464ffe517c55e243d3266082231c4f9aceaf4c570d4de552a0fd2ba8de

ENTRYPOINT ["npm", "run", "test:ci"]
CMD ["--", "--browser", "chrome"]

COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY cypress.config.js .
COPY cypress cypress/
