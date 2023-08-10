/*
Copyright 2023 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
	@@ -11,4 +11,16 @@ See the License for the specific language governing permissions and
limitations under the License.
*/

import { mergeConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

import baseConfig from './vite.config';

export default mergeConfig(baseConfig({}), {
  plugins: [
    visualizer({
      open: true,
      template: 'treemap'
    })
  ]
});
