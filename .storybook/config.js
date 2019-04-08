/*
Copyright 2019 The Tekton Authors
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

addDecorator(story => <Container story={story} />);
addDecorator(withKnobs);

addParameters({
  options: {
    brandTitle: 'Tekton Components',
    brandUrl: 'https://github.com/tektoncd/dashboard',
    isFullScreen: false,
    showNav: true,
    showPanel: true,
    panelPosition: 'bottom',
    sortStoriesByKind: false,
    hierarchySeparator: /\/|\./,
    hierarchyRootSeparator: /\|/,
    sidebarAnimations: true,
    enableShortcuts: true,
    theme: undefined
  },
});

function loadStories() {
  const req = require.context('../src/components', true, /\.stories.js$/);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
