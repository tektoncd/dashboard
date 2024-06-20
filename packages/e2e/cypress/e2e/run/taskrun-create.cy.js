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

const namespace = 'tekton-dashboard-e2e-taskrun-create';
describe('Create TaskRun', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should create TaskRun', function () {
    const uniqueNumber = Date.now();

    const taskName = `simple-task-${uniqueNumber}`;
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
    cy.contains('a', `${taskName}-run`).click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });

  it('should populate YAML editor based on form inputs', function () {
    const uniqueNumber = Date.now();

    const taskName = `simple-task-${uniqueNumber}`;
    const taskRunName = `run-${uniqueNumber}`;
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
    cy.get('[id=create-taskrun--namespaces-dropdown]').should(
      'have.value',
      namespace
    );
    cy.get('[id=create-taskrun--tasks-dropdown]').should(
      'have.value',
      taskName
    );

    cy.get('#create-taskrun--taskrunname').type(taskRunName);

    cy.get('#create-taskrun--timeout').type('10m');

    cy.contains('button', 'YAML Mode').click();
    cy.url().should('include', 'mode=yaml');

    cy.contains('.cm-content', `name: ${taskRunName}`);
    cy.contains('.cm-content', `name: ${taskName}`);
    cy.contains('.cm-content', 'timeout: 10m');

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'TaskRuns');
    cy.contains('a', taskRunName).click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });

  it('should create TaskRun in YAML mode', function () {
    const uniqueNumber = Date.now();

    const taskRunName = `yaml-mode-${uniqueNumber}`;
    const taskRun = `apiVersion: tekton.dev/v1
kind: TaskRun
metadata:
  name: ${taskRunName}
  namespace: ${namespace}
spec:
  taskSpec:
    steps:
      - name: echo
        image: docker.io/library/busybox
        script: |
          #!/bin/ash
          echo "Hello World!"
      `;
    cy.visit(`/#/taskruns/create`);

    cy.contains('button', 'YAML Mode').click();
    cy.url().should('include', 'mode=yaml');

    cy.get('.cm-content').clear();
    cy.get('.cm-content').type(taskRun, { preserveIndentation: true });

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'TaskRuns');
    cy.get(`[title=${taskRunName}]`).click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });

  it('should create TaskRun when open YAML mode directly', function () {
    const uniqueNumber = Date.now();

    const taskRunName = `yaml-mode-${uniqueNumber}`;
    const taskRun = `apiVersion: tekton.dev/v1
kind: TaskRun
metadata:
  name: ${taskRunName}
  namespace: ${namespace}
spec:
  taskSpec:
    steps:
      - name: echo
        image: docker.io/library/busybox
        script: |
          #!/bin/ash
          echo "Hello World!"
      `;
    cy.visit(`/#/taskruns/create?mode=yaml`);

    cy.get('.cm-content').clear();
    cy.get('.cm-content').type(taskRun, { preserveIndentation: true });

    cy.contains('button', 'Create').click();

    cy.contains('h1', 'TaskRuns');
    cy.get(`[title=${taskRunName}]`).click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');

    cy.contains('.tkn--log', 'Hello World!');
    cy.contains('.tkn--log', 'Step completed successfully');
  });
});
