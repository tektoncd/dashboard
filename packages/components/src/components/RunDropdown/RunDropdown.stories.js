/*
Copyright 2019-2020 The Tekton Authors
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

import RunDropdown from './RunDropdown';

export default {
  component: RunDropdown,
  decorators: [
    storyFn => (
      <div
        style={{ width: '200px', display: 'flex', justifyContent: 'flex-end' }}
      >
        {storyFn()}
      </div>
    )
  ],
  title: 'Components/RunDropdown'
};

export const Base = () => (
  <RunDropdown
    items={[
      { actionText: 'Rerun', action: () => {} },
      {
        actionText: 'disabled option',
        disable: () => true,
        action: () => {},
        modalProperties: {
          heading: 'Modal Heading',
          primaryButtonText: 'primary text',
          secondaryButtonText: 'secondary text',
          body: () => 'modal body'
        }
      },
      {
        actionText: 'Delete',
        action: () => {},
        danger: true,
        hasDivider: true,
        modalProperties: {
          danger: true,
          heading: 'Modal Heading',
          primaryButtonText: 'primary text',
          secondaryButtonText: 'secondary text',
          body: () => 'modal body'
        }
      }
    ]}
  />
);
