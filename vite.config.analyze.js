/*
Copyright 2023 The Tekton Authors
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

import { defineConfig, mergeConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

import baseConfig from './vite.config';

export default mergeConfig(
  baseConfig({}),
  defineConfig({
    plugins: [
      visualizer({
        open: true,
        template: 'treemap'
      })
    ]
  })
);
