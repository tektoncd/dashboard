/*
Copyright 2023-2024 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const namespace = 'tekton-dashboard-e2e-common-pipelinerun';
describe('Display PipelineRun', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should display a PipelineRun', function () {
    const uniqueNumber = Date.now();

    const pipelineRunName = `common-pipelinerun-${uniqueNumber}`;
    const pipelineRun = `apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: ${pipelineRunName}
  namespace: ${namespace}
spec:
  pipelineSpec:
    tasks:
      - name: hello
        taskSpec:
          steps:
            - name: echo
              image: docker.io/library/busybox
              script: |
                #!/bin/ash
                echo "Hello World!"
    `;
    cy.applyResource(pipelineRun);

    cy.visit(`/#/pipelineruns`);

    cy.contains('h1', 'PipelineRuns');
    cy.get(`[title=${pipelineRunName}]`).click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');
  });
});
