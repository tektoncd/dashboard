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

import { addons } from '@storybook/addons';
// import { themes } from '@storybook/theming';

import theme from './theme';

addons.setConfig({
  enableShortcuts: true,
  isFullScreen: false,
  panelPosition: 'bottom',
  showNav: true,
  showPanel: true,
  sidebarAnimations: true,
  theme,
  // theme: themes.dark
});
