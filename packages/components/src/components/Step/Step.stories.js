/*
Copyright 2019-2024 The Tekton Authors
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

import Step from './Step';

export default {
  args: {
    exitCode: 0,
    onSelect: action('selected'),
    stepName: 'build'
  },
  component: Step,
  title: 'Step'
};

export const Default = {};
export const Selected = { args: { selected: true } };
export const Waiting = { args: { status: 'waiting' } };
export const Running = { args: { status: 'running' } };

export const Completed = {
  args: { reason: 'Completed', status: 'terminated' }
};

export const CompletedWithWarning = {
  args: {
    ...Completed.args,
    exitCode: 1
  },
  name: 'Completed with warning'
};

export const Error = { args: { reason: 'Error', status: 'terminated' } };
