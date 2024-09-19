/*
Copyright 2022-2024 The Tekton Authors
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

const namespace = 'tekton-dashboard-e2e-pipelinerun-create';
describe('Create PipelineRun', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should create PipelineRun', function () {
    const uniqueNumber = Date.now();

    const pipelineName = `simple-pipeline-${uniqueNumber}`;
    const pipeline = `apiVersion: tekton.dev/v1
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
            image: docker.io/library/busybox
            script: |
              #!/bin/ash
              echo "Hello World!"
    `;
    cy.applyResource(pipeline);
    cy.visit(
      `/#/pipelineruns/create?namespace=${namespace}&pipelineName=${pipelineName}`
    );
    cy.contains('h1', 'Create PipelineRun');

    cy.get('[id=create-pipelinerun--namespaces-dropdown]').should(
      'have.value',
      namespace
    );
    cy.get('[id=create-pipelinerun--pipelines-dropdown]').should(
      'have.value',
      pipelineName
    );

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'PipelineRuns');
    cy.contains('a', `${pipelineName}-run`).click();
    cy.contains('h1', `${pipelineName}-run`);

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('[role=button]', 'echo').click();

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });

  it('should populate YAML editor based on form inputs', function () {
    const uniqueNumber = Date.now();

    const pipelineName = `simple-pipeline-${uniqueNumber}`;
    const pipelineRunName = `run-${uniqueNumber}`;
    const pipeline = `apiVersion: tekton.dev/v1
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
            image: docker.io/library/busybox
            script: |
              #!/bin/ash
              echo "Hello World!"
    `;
    cy.applyResource(pipeline);
    cy.visit(
      `/#/pipelineruns/create?namespace=${namespace}&pipelineName=${pipelineName}`
    );
    cy.contains('h1', 'Create PipelineRun');

    cy.get('[id=create-pipelinerun--namespaces-dropdown]').should(
      'have.value',
      namespace
    );
    cy.get('[id=create-pipelinerun--pipelines-dropdown]').should(
      'have.value',
      pipelineName
    );

    cy.get('#create-pipelinerun--pipelinerunname').type(pipelineRunName);

    cy.get('#create-pipelinerun--timeouts--pipeline').type('10m');

    cy.contains('button', 'YAML Mode').click();
    cy.url().should('include', 'mode=yaml');

    cy.contains('.cm-content', `name: ${pipelineRunName}`);
    cy.contains('.cm-content', `name: ${pipelineName}`);
    cy.contains('.cm-content', 'pipeline: 10m');

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'PipelineRuns');
    cy.contains('a', pipelineRunName).click();
    cy.contains('h1', pipelineRunName);

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('[role=button]', 'echo').click();

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });

  it('should create PipelineRun in YAML mode', function () {
    const uniqueNumber = Date.now();

    const pipelineRunName = `yaml-mode-${uniqueNumber}`;
    const pipelineRun = `apiVersion: tekton.dev/v1
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
    cy.visit(`/#/pipelineruns/create`);

    cy.contains('button', 'YAML Mode').click();
    cy.url().should('include', 'mode=yaml');

    cy.get('.cm-content').clear();
    cy.get('.cm-content').type(pipelineRun, { preserveIndentation: true });

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'PipelineRuns');
    cy.get(`[title=${pipelineRunName}]`).click();
    cy.contains('h1', pipelineRunName);

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('[role=button]', 'echo').click();

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });

  it('should create PipelineRun when open YAML mode directly', function () {
    const uniqueNumber = Date.now();

    const pipelineRunName = `yaml-mode-${uniqueNumber}`;
    const pipelineRun = `apiVersion: tekton.dev/v1
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
    cy.visit(`/#/pipelineruns/create?mode=yaml`);

    cy.get('.cm-content').clear();
    cy.get('.cm-content').type(pipelineRun, { preserveIndentation: true });

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'PipelineRuns');
    cy.get(`[title=${pipelineRunName}]`).click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('[role=button]', 'echo').click();

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });
});
