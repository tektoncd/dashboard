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

import { withThemeByClassName } from '@storybook/addon-themes';

import Container from './Container';

const parameters = {
  options: {
    storySort: {
      order: ['Getting started', 'Components', 'Containers', '*', 'Experimental']
    }
  },
  backgrounds: {
    disable: true,
    grid: {
      disable: true,
      cellSize: 16,
      opacity: 0.2,
      cellAmount: 1,
      offsetX: 0,
      offsetY: 0
    }
  },
  controls: { hideNoControlsWarning: true }
};

const decorators = [
  withThemeByClassName({
    themes: {
      light: 'tkn--theme-light tkn--storybook-theme',
      dark: 'tkn--theme-dark tkn--storybook-theme',
      system: 'tkn--theme-system tkn--storybook-theme'
    },
    defaultTheme: 'system'
  }),
  (story, context) => (
    <Container
      notes={context.parameters.notes}
      path={context.args.path}
      route={context.args.route}
      story={story}
    />
  )
];

const preview = {
  decorators,
  parameters
  // tags: ['autodocs'] // revisit with Storybook 9 and code panel
};

export default preview;
