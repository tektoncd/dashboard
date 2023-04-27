/*
Copyright 2019-2023 The Tekton Authors
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

import { TextDecoder, TextEncoder } from 'util';

import { server } from './msw';

// Establish API mocking before all tests.
beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'bypass' // reduce noise in test logs, TODO: revisit
  })
);
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

window.HTMLElement.prototype.scrollIntoView =
  function scrollIntoViewTestStub() {};
window.TextDecoder = TextDecoder;
window.TextEncoder = TextEncoder;

const { getComputedStyle } = window;
window.getComputedStyle = element => getComputedStyle(element);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
