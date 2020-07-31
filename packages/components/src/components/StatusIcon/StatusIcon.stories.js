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

import StatusIcon from './StatusIcon';

export default {
  component: StatusIcon,
  title: 'Components/StatusIcon'
};

export const Queued = () => <StatusIcon />;

export const Pending = () => <StatusIcon reason="Pending" status="Unknown" />;

export const Running = () => <StatusIcon reason="Running" status="Unknown" />;

export const Succeeded = () => <StatusIcon status="True" />;

export const Failed = () => <StatusIcon status="False" />;
