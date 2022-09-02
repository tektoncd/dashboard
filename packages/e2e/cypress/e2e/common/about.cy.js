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

describe('About page', () => {
  before(() => {
    cy.request('/v1/properties')
      .then(({ body }) => body)
      .as('installProperties');
  });

  it('should display install metadata', function () {
    cy.visit('/');
    cy.hash().should('equal', '#/about');
    cy.get('h1').contains('About Tekton');

    const {
      dashboardNamespace,
      dashboardVersion,
      isReadOnly,
      pipelinesNamespace,
      pipelinesVersion,
      triggersNamespace,
      triggersVersion
    } = this.installProperties;

    cy.get('#tkn--about--dashboard-tile').contains(dashboardNamespace);
    cy.get('#tkn--about--dashboard-tile').contains(dashboardVersion);
    if (isReadOnly) {
      cy.get('#tkn--about--dashboard-tile').contains('ReadOnly');
    }

    cy.get('#tkn--about--pipelines-tile').contains(pipelinesNamespace);
    cy.get('#tkn--about--pipelines-tile').contains(pipelinesVersion);

    cy.get('#tkn--about--triggers-tile').contains(triggersNamespace);
    cy.get('#tkn--about--triggers-tile').contains(triggersVersion);
  });
});
