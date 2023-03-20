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

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('applyResource', resource => {
  cy.exec(`echo "${resource}" | kubectl apply -f -`);
});

Cypress.Commands.add('createNamespace', namespace => {
  cy.exec(`kubectl create namespace ${namespace}`, {
    failOnNonZeroExit: false
  });
});

Cypress.Commands.add('deleteNamespace', namespace => {
  cy.exec(`kubectl delete namespace ${namespace}`, {
    failOnNonZeroExit: false
  });
});

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  let textToType = text;
  if (options && options.preserveIndentation) {
    textToType = text
      .split('\n')
      .map(line => `{home}${line}`) // {home} is interpreted by Cypress and returns the cursor to the start of the line
      .join('\n');
  }

  return originalFn(element, textToType, options);
});
