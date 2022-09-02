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

const { defineConfig } = require('cypress');

const isCI = process.env.CI === 'true';

module.exports = defineConfig({
  e2e: {
    baseUrl: isCI
      ? 'http://host.docker.internal:9097'
      : 'http://localhost:8000',
    // experimentalSessionAndOrigin: true, // default is false
    experimentalStudio: true
  },
  screenshotOnRunFailure: !isCI,
  video: !isCI,
  viewportHeight: 800, // default 660
  viewportWidth: 1280 // default 1000
  // waitForAnimations: true // disable to account for spinners?
});
