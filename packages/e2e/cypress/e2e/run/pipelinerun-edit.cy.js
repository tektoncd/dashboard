/*
Copyright 2022-2026 The Tekton Authors
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

const carbonPrefix = Cypress.expose('carbonPrefix');

const namespace = 'tkn-dashboard-e2e-pipelinerun-edit';
describe('Edit and run PipelineRun', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should create PipelineRun on edit and run', function () {
    const uniqueNumber = Date.now();
    const pipelineName = `sp-${uniqueNumber}`;
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

    cy.get(
      `td:has(.${carbonPrefix}--link[title*=${pipelineName}-run]) + td:has(.tkn--status[data-reason=Succeeded])`,
      { timeout: 15000 }
    ).should('have.length', 1);

    cy.contains('a', `${pipelineName}-run`).click();
    cy.contains('button', 'Actions').click();
    cy.contains('[role=menuitem]', 'Edit and run').click();
    cy.get('.cm-content').contains(`name: ${pipelineName}`);
    cy.contains('button', 'Create').click();
    cy.contains('h1', 'PipelineRuns');

    cy.get(
      `td:has(.${carbonPrefix}--link[title*=${pipelineName}-run]) + td:has(.tkn--status[data-reason=Succeeded])`,
      { timeout: 15000 }
    ).should('have.length', 2);
  });
});
