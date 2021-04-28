/*
Copyright 2020-2021 The Tekton Authors
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
import classNames from 'classnames';
import {
  CheckmarkFilled20 as CheckmarkFilled,
  CheckmarkOutline20 as CheckmarkOutline,
  CloseFilled20 as CloseFilled,
  CloseOutline20 as CloseOutline,
  Time20 as Pending
} from '@carbon/icons-react';
import { isRunning } from '@tektoncd/dashboard-utils';

import { Spinner } from '..';

const icons = {
  normal: {
    cancelled: CloseFilled,
    error: CloseFilled,
    pending: Pending,
    running: Spinner,
    success: CheckmarkFilled
  },
  inverse: {
    cancelled: CloseOutline,
    error: CloseOutline,
    pending: Pending,
    running: Spinner,
    success: CheckmarkOutline
  }
};

export default function StatusIcon({
  DefaultIcon,
  type = 'normal',
  reason,
  status,
  title
}) {
  let statusClass;
  if (
    (!status && !DefaultIcon) ||
    (status === 'Unknown' && reason === 'Pending')
  ) {
    statusClass = 'pending';
  } else if (isRunning(reason, status)) {
    statusClass = 'running';
  } else if (
    status === 'True' ||
    (status === 'terminated' && reason === 'Completed')
  ) {
    statusClass = 'success';
  } else if (
    status === 'False' &&
    (reason === 'PipelineRunCancelled' || reason === 'TaskRunCancelled')
  ) {
    statusClass = 'cancelled';
  } else if (
    status === 'False' ||
    status === 'cancelled' ||
    status === 'terminated' ||
    (status === 'Unknown' && reason === 'PipelineRunCouldntCancel')
  ) {
    statusClass = 'error';
  }

  const Icon = icons[type]?.[statusClass] || DefaultIcon;

  return Icon ? (
    <Icon
      className={classNames('tkn--status-icon', {
        [`tkn--status-icon--${statusClass}`]: statusClass
      })}
    >
      {title && <title>{title}</title>}
    </Icon>
  ) : null;
}
