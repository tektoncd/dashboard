/*
Copyright 2022-2026 The Tekton Authors
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
const { unlinkSync } = require('node:fs');

const isCI = process.env.CI === 'true';

module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:8000',
    experimentalRunAllSpecs: true,
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      config.expose.carbonPrefix = 'cds';

      on('after:spec', (spec, results) => {
        if (isCI && results?.video && results.stats.failures === 0) {
          console.log('Deleting video for passing test');
          unlinkSync(results.video);
        }
      });

      return config;
    }
  },
  screenshotOnRunFailure: !isCI,
  video: true,
  videoCompression: true,
  viewportHeight: 1024, // default 660
  viewportWidth: 1280 // default 1000
  // waitForAnimations: true // disable to account for spinners?
});
