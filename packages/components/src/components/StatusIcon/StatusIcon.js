/*
Copyright 2020-2022 The Tekton Authors
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
  CheckmarkFilledWarning20 as CheckmarkFilledWarning,
  CheckmarkOutline20 as CheckmarkOutline,
  CloseFilled20 as CloseFilled,
  CloseOutline20 as CloseOutline,
  Time20 as Pending,
  WarningAltFilled20 as WarningFilled
} from '@carbon/icons-react';
import { isRunning } from '@tektoncd/dashboard-utils';

import { Spinner } from '..';

const icons = {
  inverse: {
    cancelled: CloseOutline,
    error: CloseOutline,
    pending: Pending,
    running: Spinner,
    success: CheckmarkOutline,
    warning: WarningFilled
  },
  normal: {
    cancelled: CloseFilled,
    error: CloseFilled,
    pending: Pending,
    running: Spinner,
    success: CheckmarkFilled,
    warning: CheckmarkFilledWarning
  }
};

const statusClassNames = {
  cancelled: 'tkn--status-icon--cancelled',
  error: 'tkn--status-icon--error',
  pending: 'tkn--status-icon--pending',
  running: 'tkn--status-icon--running',
  success: 'tkn--status-icon--success',
  warning: 'tkn--status-icon--warning'
};

const typeClassNames = {
  inverse: 'tkn--status-icon--type-inverse',
  normal: 'tkn--status-icon--type-normal'
};

export default function StatusIcon({
  DefaultIcon,
  hasWarning,
  isCustomTask,
  reason,
  status,
  title,
  type = 'normal'
}) {
  let statusClass;
  if (
    (!status && !DefaultIcon) ||
    (status === 'Unknown' && reason === 'Pending')
  ) {
    statusClass = 'pending';
  } else if (
    status === 'True' ||
    (status === 'terminated' && reason === 'Completed')
  ) {
    statusClass = hasWarning ? 'warning' : 'success';
  } else if (
    status === 'False' &&
    (reason === 'PipelineRunCancelled' ||
      reason === 'Cancelled' ||
      reason === 'TaskRunCancelled')
  ) {
    statusClass = 'cancelled';
  } else if (
    status === 'False' ||
    status === 'cancelled' ||
    status === 'terminated' ||
    (status === 'Unknown' && reason === 'PipelineRunCouldntCancel')
  ) {
    statusClass = 'error';
  } else if (
    isRunning(reason, status) ||
    (isCustomTask && status === 'Unknown')
  ) {
    statusClass = 'running';
  }

  const Icon = icons[type]?.[statusClass] || DefaultIcon;

  return Icon ? (
    <Icon
      className={classNames('tkn--status-icon', typeClassNames[type], {
        [statusClassNames[statusClass]]: statusClass
      })}
    >
      {title && <title>{title}</title>}
    </Icon>
  ) : null;
}
