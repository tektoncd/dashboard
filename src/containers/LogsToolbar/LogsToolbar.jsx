/*
Copyright 2020-2024 The Tekton Authors
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

import { LogsToolbar } from '@tektoncd/dashboard-components';

import { getExternalLogURL, getPodLogURL } from '../../api';

export default function LogsToolbarContainer({
  externalLogsURL,
  isMaximized,
  isUsingExternalLogs,
  logLevels,
  onToggleLogLevel,
  onToggleMaximized,
  onToggleShowTimestamps,
  showTimestamps,
  stepStatus,
  taskRun
}) {
  const { container } = stepStatus;
  const { namespace } = taskRun.metadata;
  const { podName } = taskRun.status;

  const logURL = isUsingExternalLogs
    ? getExternalLogURL({ container, externalLogsURL, namespace, podName })
    : getPodLogURL({
        container,
        name: podName,
        namespace
      });

  return (
    <LogsToolbar
      isMaximized={isMaximized}
      logLevels={logLevels}
      name={`${podName}__${container}__log.txt`}
      showTimestamps={showTimestamps}
      onToggleLogLevel={onToggleLogLevel}
      onToggleMaximized={onToggleMaximized}
      onToggleShowTimestamps={onToggleShowTimestamps}
      url={logURL}
    />
  );
}
