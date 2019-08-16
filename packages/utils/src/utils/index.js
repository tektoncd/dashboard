/*
Copyright 2019 The Tekton Authors
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
import CheckmarkFilled from '@carbon/icons-react/lib/checkmark--filled/16';
import CloseFilled from '@carbon/icons-react/lib/close--filled/16';
import { Spinner } from '@tektoncd/dashboard-components';

export { paths, urls } from './router';

export const ALL_NAMESPACES = '*';

export function getErrorMessage(error) {
  if (!error || typeof error === 'string') {
    return error;
  }

  return (
    error.message || JSON.stringify(error, Object.getOwnPropertyNames(error))
  );
}

export function getStatus(resource) {
  const { conditions = [] } = resource.status || {};
  return conditions.find(condition => condition.type === 'Succeeded') || {};
}

export function isRunning(reason, status) {
  return (
    status === 'Unknown' && (reason === 'Running' || reason === 'Building')
  );
}

export function getStatusIcon({ reason, status }) {
  if (isRunning(reason, status)) {
    return <Spinner className="status-icon" />;
  }

  let Icon;
  if (status === 'True') {
    Icon = CheckmarkFilled;
  } else if (status === 'False') {
    Icon = CloseFilled;
  }

  return Icon ? <Icon className="status-icon" /> : null;
}
