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

import snakeCase from 'lodash.snakecase';
import { getPodLog } from '../api';

export function sortRunsByStartTime(runs) {
  runs.sort((a, b) => {
    const aTime = (a.status || {}).startTime;
    const bTime = (b.status || {}).startTime;
    if (!aTime) {
      return -1;
    }
    if (!bTime) {
      return 1;
    }
    return -1 * aTime.localeCompare(bTime);
  });
}

export function typeToPlural(type) {
  return `${snakeCase(type).toUpperCase()}S`;
}

export async function fetchLogs(stepName, stepStatus, taskRun) {
  const { pod, namespace } = taskRun;
  let logs;
  if (pod) {
    const { container = `step-${stepName}` } = stepStatus;
    logs = getPodLog({
      container,
      name: pod,
      namespace
    });
  }
  return logs;
}

export function isStale(resource, state, resourceIdField = 'uid') {
  const { [resourceIdField]: identifier } = resource.metadata;
  if (!state[identifier]) {
    return false;
  }
  const existingVersion = parseInt(
    state[identifier].metadata.resourceVersion,
    10
  );
  const incomingVersion = parseInt(resource.metadata.resourceVersion, 10);
  return existingVersion > incomingVersion;
}

export function getGitValues(url) {
  let copyUrl;

  copyUrl = url.toLowerCase().replace(/https?:\/\//, '');

  copyUrl = copyUrl.split('/');
  const numSlashes = copyUrl.length;
  if (numSlashes < 2) {
    return {};
  }

  const [gitServer, gitOrg, gitRepo] = copyUrl;

  return { gitServer, gitOrg, gitRepo: `${gitRepo}.git` };
}
