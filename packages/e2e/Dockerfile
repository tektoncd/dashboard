# Copyright 2022-2023 The Tekton Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM cypress/browsers:node18.12.0-chrome107
RUN curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://dl.k8s.io/apt/doc/apt-key.gpg &&\
    echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list &&\
    apt-get update && apt-get install -y \
    kubectl \
    && rm -rf /var/lib/apt/lists/*
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
