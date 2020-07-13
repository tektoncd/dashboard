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
/* istanbul ignore file */

import React from 'react';
import {
  CheckmarkFilled20 as CheckmarkFilled,
  CloseFilled20 as CloseFilled,
  Time20 as Time
} from '@carbon/icons-react';
import { isRunning } from '@tektoncd/dashboard-utils';

import { Spinner } from '..';

export default function StatusIcon({ reason, status }) {
  if (!status || (status === 'Unknown' && reason === 'Pending')) {
    return <Time className="tkn--status-icon" />;
  }

  if (isRunning(reason, status)) {
    return <Spinner className="tkn--status-icon" />;
  }

  let Icon;
  if (status === 'True') {
    Icon = CheckmarkFilled;
  } else if (status === 'False') {
    Icon = CloseFilled;
  } else if (status === 'Unknown' && reason === 'PipelineRunCouldntCancel') {
    Icon = CloseFilled;
  }

  return Icon ? <Icon className="tkn--status-icon" /> : null;
}
