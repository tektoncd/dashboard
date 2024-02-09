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

describe('About page', () => {
  before(() => {
    cy.request('/v1/properties').its('body').as('installProperties');
  });

  it('should display install metadata', function () {
    cy.visit('/#/about');
    cy.contains('h1', 'About Tekton');

    const {
      dashboardNamespace,
      dashboardVersion,
      isReadOnly,
      logoutURL,
      pipelinesNamespace,
      pipelinesVersion,
      triggersNamespace,
      triggersVersion
    } = this.installProperties;

    cy.contains('#tkn--about--dashboard-tile', dashboardNamespace);
    cy.contains('#tkn--about--dashboard-tile', dashboardVersion);

    if (isReadOnly) {
      cy.contains('#tkn--about--dashboard-tile', 'ReadOnly');
    } else {
      cy.get('#tkn--about--dashboard-tile')
        .contains('ReadOnly')
        .should('not.exist');
    }

    if (logoutURL) {
      cy.contains('#tkn--about--dashboard-tile', 'LogoutURL');
    } else {
      cy.get('#tkn--about--dashboard-tile')
        .contains('LogoutURL')
        .should('not.exist');
    }

    cy.contains('#tkn--about--pipelines-tile', pipelinesNamespace);
    cy.contains('#tkn--about--pipelines-tile', pipelinesVersion);

    cy.contains('#tkn--about--triggers-tile', triggersNamespace);
    cy.contains('#tkn--about--triggers-tile', triggersVersion);
  });
});
