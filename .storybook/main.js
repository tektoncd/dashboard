/*
Copyright 2020-2025 The Tekton Authors
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

const config = {
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-themes',
    'storybook-addon-remix-react-router'
  ],
  core: { disableTelemetry: true },
  docs: {
    defaultName: 'Documentation'
  },
  features: {
    buildStoriesJson: true
  },
  framework: '@storybook/react-vite',
  refs: (_config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        carbon11: {
          title: 'Carbon v11',
          url: 'https://react.carbondesignsystem.com/',
          expanded: false
        }
      };
    }
    return {};
  },
  stories: (_config, { configType }) => ([
    { directory: '.', files: 'Welcome.mdx' },
    configType === 'DEVELOPMENT' ? { directory: '../src', files: '**/*.stories.@(js|jsx)', titlePrefix: 'Containers' } : null,
    { directory: '../packages/components', files: '**/*.stories.@(js|jsx)', titlePrefix: 'Components' },
    { directory: '../packages/graph', files: '**/*.stories.@(js|jsx)', titlePrefix: 'Experimental/Graph' }
  ].filter(Boolean)),
  async viteFinal(config, { configType }) {
    config.server.watch = {
      ignored: ['**/coverage/**']
    };

    // fallback to default to resolve issue with MDX rendering
    delete config.resolve?.extensions;
    return config;
  }
};

export default config;
