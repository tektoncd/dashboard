/*
Copyright 2019-2021 The Tekton Authors
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

import { setLogger } from 'react-query';
import fetch from 'node-fetch';
import fetchMock from 'fetch-mock';
import { TextDecoder, TextEncoder } from 'util';

setLogger({
  log: console.log, // eslint-disable-line no-console
  warn: console.warn, // eslint-disable-line no-console
  error: () => {}
});

if (!global.fetch) {
  global.fetch = fetch;
}

fetchMock.catch();
fetchMock.config.overwriteRoutes = true;
fetchMock.config.warnOnFallback = false;

window.HTMLElement.prototype.scrollIntoView = function scrollIntoViewTestStub() {};
window.TextDecoder = TextDecoder;
window.TextEncoder = TextEncoder;
