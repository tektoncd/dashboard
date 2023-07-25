/*
Copyright 2020-2023 The Tekton Authors
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

import React from 'react';

import Container from './Container';

const parameters = {
  options: {
    storySort: {
      order: ['Getting started', 'Components', 'Containers', '*', 'Experimental']
    }
  },
  backgrounds: {
    default: 'gray10',
    grid: {
      disable: true,
      cellSize: 16,
      opacity: 0.2,
      cellAmount: 1,
      offsetX: 0,
      offsetY: 0
    },
    values: [
      { name: 'white', value: 'white' },
      { name: 'gray10', value: '#f4f4f4' },
      { name: 'gray90', value: '#262626' },
      { name: 'debug', value: 'red' }
    ]
  },
  controls: { hideNoControlsWarning: true }
};

const decorators = [
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
};

export default preview;
