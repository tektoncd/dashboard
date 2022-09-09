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

describe('Translations', () => {
  it('should display translated content for a supported language', () => {
    cy.visit('/#/about', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'language', {
          value: 'zh-Hans'
        });
      }
    });
    cy.contains('h1', '关于'); // About Tekton
    cy.contains('h2', '环境详情'); // Environment details
    cy.contains('h2', '文档'); // Documentation and resources
  });

  it('should fallback to English content for an unsupported language', () => {
    cy.visit('/#/about', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'language', {
          value: 'zz'
        });
      }
    });
    cy.contains('h1', 'About Tekton');
    cy.contains('h2', 'Environment details');
    cy.contains('h2', 'Documentation and resources');
  });
});
