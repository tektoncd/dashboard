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

import StepStatus from './index';

const status = {
  name: 'build-and-push',
  terminated: {
    containerID: 'containerd://f7a7a2d1c678703885f43d37528206018efb0f931fbeefb',
    exitCode: 0,
    finishedAt: '2019-03-29T13:17:10Z',
    reason: 'Completed',
    startedAt: '2019-03-29T13:17:07Z'
  }
};

export default {
  component: StepStatus,
  title: 'Components/StepStatus'
};

export const Base = () => <StepStatus />;

export const WithContent = () => <StepStatus status={status} />;
