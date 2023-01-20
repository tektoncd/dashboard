/*
Copyright 2022-2023 The Tekton Authors
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

const namespace = 'tkn-dashboard-e2e-actions';
describe('Edit and run Pipeline Run', () => {
  before(() => {
    cy.exec('kubectl version --client');
    cy.exec(`kubectl create namespace ${namespace} || true`);
  });

  after(() => {
    cy.exec(`kubectl delete namespace ${namespace} || true`);
  });

  it('should create pipelinerun on edit and run', function () {
    const uniqueNumber = Date.now();
    const pipelineName = `sp-${uniqueNumber}`;
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

    cy.contains('h1', 'PipelineRuns');

    cy.get(
      `td:has(.bx--link[title*=${pipelineName}-run]) + td:has(.tkn--status[data-reason=Succeeded])`,
      { timeout: 15000 }
    ).should('have.length', 1);

    cy.contains('a', `${pipelineName}-run`).click();
    cy.contains('button', 'Actions').click();
    cy.contains('button', 'Edit and run').click();
    cy.get('.cm-content').contains(`name: ${pipelineName}`);
    cy.contains('button', 'Create').click();
    cy.contains('h1', 'PipelineRuns');

    cy.get(
      `td:has(.bx--link[title*=${pipelineName}-run]) + td:has(.tkn--status[data-reason=Succeeded])`,
      { timeout: 15000 }
    ).should('have.length', 2);
  });
});
