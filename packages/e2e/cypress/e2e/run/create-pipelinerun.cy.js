/*
Copyright 2022 The Tekton Authors
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

function preserveIndentation(input) {
  return input
    .split('\n')
    .map(line => `{home}${line}`) // {home} is interpreted by Cypress and returns the cursor to the start of the line
    .join('\n');
}

const namespace = 'e2e';
describe('Create Pipeline Run', () => {
  before(() => {
    cy.exec('kubectl version --client');
    cy.exec(`kubectl create namespace ${namespace} || true`);
  });

  after(() => {
    cy.exec(`kubectl delete namespace ${namespace} || true`);
  });

  it('should create pipelinerun', function () {
    const uniqueNumber = Date.now();

    const pipelineName = `simple-pipeline-${uniqueNumber}`;
    const pipeline = `apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: ${pipelineName}
  namespace: ${namespace}
spec:
  tasks:
    - name: hello
      taskSpec:
        steps:
          - name: echo
            image: busybox
            script: |
              #!/bin/ash
              echo "Hello World!"
    `;
    cy.exec(`echo "${pipeline}" | kubectl apply -f -`);
    cy.visit(
      `/#/pipelineruns/create?namespace=${namespace}&pipelineName=${pipelineName}`
    );
    cy.get('[id=create-pipelinerun--namespaces-dropdown]').should(
      'have.value',
      namespace
    );
    cy.get('[id=create-pipelinerun--pipelines-dropdown]').should(
      'have.value',
      pipelineName
    );

    cy.contains('button', 'Create').click();

    cy.contains(`${pipelineName}-run`).parent().click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');
  });

  it('should create pipelinerun yaml mode', function () {
    const uniqueNumber = Date.now();

    const pipelineRunName = `yaml-mode-${uniqueNumber}`;
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
              image: busybox
              script: |
                #!/bin/ash
                echo "Hello World!"
    `;
    cy.visit(`/#/pipelineruns/create`);

    cy.contains('button', 'YAML Mode').click();
    cy.url().should('include', 'mode=yaml');

    cy.get('.cm-content').type(preserveIndentation(pipelineRun));

    cy.contains('button', 'Create').click();

    cy.get(`[title=${pipelineRunName}]`).parent().click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');
  });

  it('should create pipelinerun yaml mode when open yaml mode directly', function () {
    const uniqueNumber = Date.now();

    const pipelineRunName = `yaml-mode-${uniqueNumber}`;
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
              image: busybox
              script: |
                #!/bin/ash
                echo "Hello World!"
    `;
    cy.visit(`/#/pipelineruns/create?mode=yaml`);

    cy.get('.cm-content').type(preserveIndentation(pipelineRun));

    cy.contains('button', 'Create').click();

    cy.get(`[title=${pipelineRunName}]`).parent().click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');
  });
});
