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

import kinds from '../../fixtures/kinds.json';

const carbonPrefix = Cypress.env('carbonPrefix');

describe('Read permissions', { testIsolation: false }, () => {
  before(() => {
    cy.visit('/');
    cy.hash().should('equal', '#/about');
    cy.contains('h1', 'About Tekton');
  });

  kinds.forEach(kind => {
    it(`should display ${kind.label} page`, () => {
      cy.contains(
        `.${carbonPrefix}--side-nav a`,
        new RegExp(`^${kind.label}$`)
      ).click();
      cy.hash().should('equal', `#${kind.path}`);
      cy.contains('h1', kind.label);
      cy.get('table');
      cy.get('table.tkn--data-table-skeleton').should('not.exist');
      cy.contains('Forbidden').should('not.exist');
    });
  });

  it('should display error for resources missing permissions', () => {
    const groupVersionKind = 'tekton.dev/v1alpha1/fake-kind';
    cy.visit(`/#/${groupVersionKind}`);
    cy.contains('h1', groupVersionKind);
    cy.contains('Forbidden');
  });
});
