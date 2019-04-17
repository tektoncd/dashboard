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
import { Icon } from 'carbon-components-react';

import Spinner from '../components/Spinner';

export function getStatus(resource) {
  const { conditions = [] } = resource.status || {};
  return conditions.find(condition => condition.type === 'Succeeded') || {};
}

export function isPipelineRunning(reason, status) {
  return status === 'Unknown' && reason === 'Running';
}

export function getPipelineRunStatusIcon({ reason, status }) {
  if (isPipelineRunning(reason, status)) {
    return <Spinner className="status-icon" />;
  }

  let icon;
  if (status === 'True') {
    icon = 'icon--checkmark--solid';
  } else if (status === 'False') {
    icon = 'icon--close--solid';
  }

  return icon ? <Icon name={icon} className="status-icon" /> : null;
}
