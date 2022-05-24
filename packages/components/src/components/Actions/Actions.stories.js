/*
Copyright 2019-2022 The Tekton Authors
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
import { TrashCan16 } from '@carbon/icons-react';

import Actions from './Actions';

export default {
  component: Actions,
  decorators: [
    Story => (
      <div
        style={{ width: '200px', display: 'flex', justifyContent: 'flex-end' }}
      >
        <Story />
      </div>
    )
  ],
  title: 'Components/Actions'
};

const deleteAction = {
  action: () => {},
  actionText: 'Delete',
  danger: true,
  hasDivider: true,
  icon: TrashCan16,
  modalProperties: {
    body: () => 'modal body',
    danger: true,
    heading: 'Modal Heading',
    primaryButtonText: 'primary text',
    secondaryButtonText: 'secondary text'
  }
};

const props = {
  items: [
    { action: () => {}, actionText: 'Rerun' },
    {
      action: () => {},
      actionText: 'disabled option',
      disable: () => true,
      modalProperties: {
        body: () => 'modal body',
        heading: 'Modal Heading',
        primaryButtonText: 'primary text',
        secondaryButtonText: 'secondary text'
      }
    },
    deleteAction
  ]
};

export const Base = () => <Actions {...props} />;

export const Button = () => <Actions {...props} kind="button" />;

export const SingleAction = () => (
  <Actions items={[deleteAction]} kind="button" />
);
