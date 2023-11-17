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

const namespace = 'tekton-dashboard-e2e-extensions';
describe('Extensions', () => {
  before(() => {
    cy.createNamespace(namespace);
  });

  after(() => {
    cy.deleteNamespace(namespace);
  });

  it('should display namespaces extension', () => {
    cy.visit('/');
    cy.hash().should('equal', '#/about');
    cy.contains('h1', 'About Tekton');

    cy.applyResource(`
apiVersion: dashboard.tekton.dev/v1alpha1
kind: Extension
metadata:
  name: namespaces-extension
  namespace: ${namespace}
spec:
  apiVersion: core/v1
  name: namespaces
  displayname: Namespaces
`);

    cy.contains(`.${carbonPrefix}--side-nav a`, 'Namespaces').click();
    cy.hash().should('equal', '#/core/v1/namespaces');
    cy.contains('h1', 'core/v1/namespaces');
    cy.get('table');
    cy.get('table.tkn--data-table-skeleton').should('not.exist');

    cy.contains('a', namespace).click();
    cy.contains('h1', namespace);
    cy.contains(`kubernetes.io/metadata.name: ${namespace}`);
  });
});
