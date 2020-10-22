/*
Copyright 2020 The Tekton Authors
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

export const parameters = {
  options: {
    storySort: (a, b) =>
      a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, { numeric: true })
  },
  backgrounds: {
    default: 'white',
    grid: {
      // TODO: available in 6.1.0+
      disable: false,
      cellSize: 20,
      opacity: 0.5,
      cellAmount: 5,
      offsetX: 16, // default value depends on story layout
      offsetY: 16 // fullscreen: 0, padded: 16
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

export const decorators = [
  (story, context) => (
    <Container story={story} notes={context.parameters.notes} />
  )
];
