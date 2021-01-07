/*
Copyright 2021 The Tekton Authors
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
import { action } from '@storybook/addon-actions';

import DeleteModal from './DeleteModal';

export default {
  component: DeleteModal,
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'Components/DeleteModal'
};

export const Base = () => (
  <DeleteModal
    kind="Pipelines"
    onClose={action('onClose')}
    onSubmit={action('onSubmit')}
    resources={[
      {
        metadata: {
          name: 'my-pipeline',
          namespace: 'my-namespace',
          uid: '700c9915-65f0-4309-b7e0-54d2e4dc8bea'
        }
      }
    ]}
    showNamespace={false}
  />
);
