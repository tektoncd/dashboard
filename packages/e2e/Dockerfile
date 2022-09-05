# Copyright 2022 The Tekton Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM cypress/browsers:node16.14.2-slim-chrome103-ff102
USER node
WORKDIR /home/node
ENV CI=true
ENV NO_COLOR=true
ENTRYPOINT ["npm", "run", "test:ci"]
CMD ["--", "--browser", "chrome"]

COPY package.json .
RUN npm install
COPY cypress.config.js .
COPY cypress cypress/
