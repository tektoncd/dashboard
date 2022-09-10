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

describe('Create Pipeline Run with Workspace', () => {
  let testNamespace;
  beforeEach(() => {
    testNamespace = Cypress.env('TEST_NAMESPACE');
    if (!testNamespace) {
      testNamespace = 'tekton-test';
    }
  });
  it('should create pipelinerun workspace', function () {
    cy.visit(
      `/#/pipelineruns/create?namespace=${testNamespace}&pipelineName=pipeline-with-ws`
    );
    cy.contains('Pipeline Workspace Description');

    cy.contains('configmap-ws').click();
    cy.contains('configmap-test').click();

    cy.contains('secret-ws').click();
    cy.contains('secret-test').click();

    cy.contains('empDir-ws').click();
    cy.contains('emptyDir').click();

    cy.contains('optional-ws').click();
    cy.contains('configmap-test').click();

    cy.contains('button', 'Create').click();

    cy.contains('pipeline-with-ws-run-').first().click();

    cy.get('header[class="tkn--pipeline-run-header"]', { timeout: 10000 })
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');
  });

  it('should create pipelinerun workspace with pvc', function () {
    cy.visit(
      `/#/pipelineruns/create?namespace=${testNamespace}&pipelineName=pipeline-with-ws-pvc`
    );

    cy.contains('pvc-ws').click();
    cy.contains('pvc-test').click();

    cy.contains('button', 'Create').click();

    cy.contains('pipeline-with-ws-pvc-run-').first().click();

    cy.get('header[class="tkn--pipeline-run-header"]', { timeout: 10000 })
      .find('span[class="tkn--status-label"]', { timeout: 15000 })
      .should('have.text', 'Succeeded');
  });
});
