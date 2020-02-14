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
import { addDecorator, addParameters, configure } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

import Container from './Container';

addParameters({
  options: {
    showRoots: true,
    storySort: (a, b) =>
      a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, { numeric: true })
  }
});

addDecorator(story => <Container story={story} />);
addDecorator(withKnobs);

configure(
  [
    require.context('../src', true, /(?!node_modules).*\.stories.js$/),
    require.context('../packages', true, /(?!node_modules).*\.stories.js$/)
  ],
  module
);
