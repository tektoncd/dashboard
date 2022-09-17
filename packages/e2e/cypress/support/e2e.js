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

import './commands';

beforeEach(() => {
  cy.on('window:before:load', win => {
    // we want to ensure the browser is using English as its language so tests
    // that make assertions or locate elements by text content work as expected
    Object.defineProperty(win.navigator, 'language', {
      configurable: true,
      value: 'en'
    });
  });
});
