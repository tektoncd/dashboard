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

import './StatusIcon.scss';

import React from 'react';
import classNames from 'classnames';
import {
  CheckmarkFilled20 as CheckmarkFilled,
  CloseFilled20 as CloseFilled,
  Time20 as Time
} from '@carbon/icons-react';
import { isRunning } from '@tektoncd/dashboard-utils';

import { Spinner } from '..';

export default function StatusIcon({ DefaultIcon, inverse, reason, status }) {
  let Icon = DefaultIcon;
  let statusClass;
  if (
    (!status && !DefaultIcon) ||
    (status === 'Unknown' && reason === 'Pending')
  ) {
    Icon = Time;
  } else if (isRunning(reason, status)) {
    Icon = Spinner;
    statusClass = 'running';
  } else if (
    status === 'True' ||
    (status === 'terminated' && reason === 'Completed')
  ) {
    Icon = CheckmarkFilled;
    statusClass = 'success';
  } else if (
    status === 'False' &&
    (reason === 'PipelineRunCancelled' || reason === 'TaskRunCancelled')
  ) {
    Icon = CloseFilled;
    statusClass = 'cancelled';
  } else if (
    status === 'False' ||
    status === 'cancelled' ||
    status === 'terminated' ||
    (status === 'Unknown' && reason === 'PipelineRunCouldntCancel')
  ) {
    Icon = CloseFilled;
    statusClass = 'error';
  }

  return Icon ? (
    <Icon
      className={classNames('tkn--status-icon', {
        [`tkn--status-icon--${statusClass}`]: statusClass,
        'tkn--status-icon--inverse': inverse
      })}
    />
  ) : null;
}
