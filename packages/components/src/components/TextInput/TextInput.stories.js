/*
Copyright 2019-2023 The Tekton Authors
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

import { action } from '@storybook/addon-actions';

import TextInput from './TextInput';

export default {
  args: {
    id: 'text-input-id',
    onChange: action('onChange'),
    onClick: action('onClick')
  },
  component: TextInput,
  title: 'TextInput'
};

export const Base = {
  args: {
    labelText: 'foo',
    helperText: 'this is a description of input foo',
    placeholder: 'bar'
  }
};

export const Loading = { args: { loading: true } };
