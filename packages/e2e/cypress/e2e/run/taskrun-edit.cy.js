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

const carbonPrefix = Cypress.env('carbonPrefix');

const namespace = 'tkn-dashboard-e2e-taskrun-edit';
describe('Edit and run TaskRun', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should create TaskRun on edit and run', function () {
    const uniqueNumber = Date.now();
    const taskName = `sp-${uniqueNumber}`;
    const task = `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: ${taskName}
  namespace: ${namespace}
spec:
  steps:
    - name: echo
      image: docker.io/library/busybox
      script: |
        #!/bin/ash
        echo "Hello World!"
    `;
    cy.applyResource(task);
    cy.visit(`/#/taskruns/create?namespace=${namespace}&taskName=${taskName}`);
    cy.contains('h1', 'Create TaskRun');
    cy.get('[id=create-taskrun--namespaces-dropdown]').should(
      'have.value',
      namespace
    );
    cy.get('[id=create-taskrun--tasks-dropdown]').should(
      'have.value',
      taskName
    );
    cy.contains('button', 'Create').click();

    cy.contains('h1', 'TaskRuns');

    cy.get(
      `td:has(.${carbonPrefix}--link[title*=${taskName}-run]) + td:has(.tkn--status[data-reason=Succeeded])`,
      { timeout: 15000 }
    ).should('have.length', 1);

    cy.contains('a', `${taskName}-run`).click();
    cy.contains('button', 'Actions').click();
    cy.contains('[role=menuitem]', 'Edit and run').click();
    cy.get('.cm-content').contains(`name: ${taskName}`);
    cy.contains('button', 'Create').click();
    cy.contains('h1', 'TaskRuns');

    cy.get(
      `td:has(.${carbonPrefix}--link[title*=${taskName}-run]) + td:has(.tkn--status[data-reason=Succeeded])`,
      { timeout: 15000 }
    ).should('have.length', 2);
  });
});
