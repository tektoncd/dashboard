/*
Copyright 2023 The Tekton Authors
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

const namespace = 'tekton-dashboard-e2e-import-resources';
describe('Import resources', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should complete the tutorial in the target namespace', function () {
    const role = `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: tekton-dashboard-tutorial
rules:
  - apiGroups:
      - tekton.dev
    resources:
      - tasks
      - taskruns
      - pipelines
      - pipelineruns
    verbs:
      - get
      - create
      - update
      - patch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: tekton-dashboard-tutorial
  namespace: ${namespace}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: tekton-dashboard-tutorial
subjects:
  - kind: ServiceAccount
    name: default
    namespace: tekton-dashboard
    `;

    cy.applyResource(role);

    cy.visit('/#/importresources');
    cy.get('#import-repository-url').type(
      'https://github.com/tektoncd/dashboard'
    );
    cy.get('#import-path').type('docs/tutorial');
    cy.get('#import-namespaces-dropdown').click();
    cy.contains(namespace).click();

    cy.contains(`button.${carbonPrefix}--btn--primary`, 'Import').click();
    cy.contains('a', 'View status of this run').click();

    cy.get('header[class="tkn--pipeline-run-header"]')
      .find('span[class="tkn--status-label"]', { timeout: 60000 })
      .should('have.text', 'Succeeded');

    cy.visit(`/#/namespaces/${namespace}/pipelines`);
    cy.contains('a', 'hello-goodbye');

    cy.visit(`/#/namespaces/${namespace}/tasks`);
    cy.contains('a', 'hello');
    cy.contains('a', 'goodbye');
  });
});
