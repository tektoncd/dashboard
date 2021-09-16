/*
Copyright 2019-2021 The Tekton Authors
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

import React, { useRef, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { InlineNotification, SkeletonText } from 'carbon-components-react';
import {
  Log,
  Portal,
  RunAction,
  RunHeader,
  StepDetails,
  TaskRunDetails,
  TaskTree
} from '@tektoncd/dashboard-components';
import {
  getStatus,
  getStepDefinition,
  getStepStatus,
  queryParams as queryParamConstants,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';

import {
  getLogsRetriever,
  getLogsToolbar,
  getViewChangeHandler
} from '../../utils';

import {
  rerunTaskRun,
  useEvents,
  useExternalLogsURL,
  useIsLogStreamingEnabled,
  useIsReadOnly,
  usePod,
  useSelectedNamespace,
  useTaskByKind,
  useTaskRun
} from '../../api';

const { STEP, TASK_RUN_DETAILS, VIEW } = queryParamConstants;

function notification({ intl, kind, message }) {
  const titles = {
    info: intl.formatMessage({
      id: 'dashboard.taskRun.unavailable',
      defaultMessage: 'TaskRun not available'
    }),
    error: intl.formatMessage({
      id: 'dashboard.taskRun.errorLoading',
      defaultMessage: 'Error loading TaskRun'
    })
  };
  return (
    <InlineNotification
      kind={kind}
      hideCloseButton
      lowContrast
      title={titles[kind]}
      subtitle={message}
    />
  );
}

export function TaskRunContainer({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();

  const { namespace: namespaceParam, taskRunName } = params;

  const queryParams = new URLSearchParams(location.search);
  const selectedStepId = queryParams.get(STEP);
  const view = queryParams.get(VIEW);
  const showTaskRunDetails = queryParams.get(TASK_RUN_DETAILS);

  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;

  const maximizedLogsContainer = useRef();
  const [isLogsMaximized, setIsLogsMaximized] = useState(false);
  const [rerunNotification, setRerunNotification] = useState(null);
  const [isUsingExternalLogs, setIsUsingExternalLogs] = useState(false);

  const externalLogsURL = useExternalLogsURL();
  const isLogStreamingEnabled = useIsLogStreamingEnabled();
  const isReadOnly = useIsReadOnly();

  useTitleSync({
    page: 'TaskRun',
    resourceName: taskRunName
  });

  const { data: taskRun, error, isLoading: isLoadingTaskRun } = useTaskRun({
    name: taskRunName,
    namespace
  });

  const { data: task, isLoading: isLoadingTask } = useTaskByKind(
    {
      kind: taskRun?.spec.taskRef?.kind,
      name: taskRun?.spec.taskRef?.name,
      namespace
    },
    { enabled: !!taskRun?.spec.taskRef }
  );

  const podName = taskRun?.status?.podName;
  const { data: pod = {} } = usePod(
    { name: podName, namespace },
    { enabled: !!podName && view === 'pod' }
  );

  const { data: events = [] } = useEvents(
    { involvedObjectKind: 'Pod', involvedObjectName: podName, namespace },
    { enabled: !!podName && view === 'pod' }
  );

  function toggleLogsMaximized() {
    setIsLogsMaximized(state => !state);
  }

  function getLogContainer({ stepName, stepStatus, taskRun: run }) {
    if (!selectedStepId || !stepStatus) {
      return null;
    }

    const logsRetriever = getLogsRetriever({
      externalLogsURL,
      isLogStreamingEnabled,
      onFallback: setIsUsingExternalLogs
    });

    const LogsRoot = isLogsMaximized ? Portal : React.Fragment;

    return (
      <LogsRoot
        {...(isLogsMaximized
          ? { container: maximizedLogsContainer.current }
          : null)}
      >
        <Log
          toolbar={getLogsToolbar({
            externalLogsURL,
            isMaximized: isLogsMaximized,
            isUsingExternalLogs,
            stepStatus,
            taskRun: run,
            toggleMaximized: !!maximizedLogsContainer && toggleLogsMaximized
          })}
          fetchLogs={() => logsRetriever(stepName, stepStatus, run)}
          key={stepName}
          stepStatus={stepStatus}
          isLogsMaximized={isLogsMaximized}
          enableLogAutoScroll
          enableLogScrollButtons
        />
      </LogsRoot>
    );
  }

  function handleTaskSelected(_, newSelectedStepId) {
    if (newSelectedStepId) {
      queryParams.set(STEP, newSelectedStepId);
      queryParams.delete(TASK_RUN_DETAILS);
    } else {
      queryParams.delete(STEP);
      queryParams.set(TASK_RUN_DETAILS, true);
    }

    if (newSelectedStepId !== selectedStepId) {
      queryParams.delete(VIEW);
    }

    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  }

  if (isLoadingTaskRun || isLoadingTask) {
    return <SkeletonText heading width="60%" />;
  }

  if (error) {
    return notification({
      intl,
      kind: 'error',
      message: intl.formatMessage({
        id: 'dashboard.taskRun.errorLoading',
        defaultMessage: 'Error loading TaskRun'
      })
    });
  }

  if (!taskRun) {
    return notification({
      intl,
      kind: 'info',
      message: intl.formatMessage({
        id: 'dashboard.taskRun.unavailable',
        defaultMessage: 'TaskRun not available'
      })
    });
  }

  const definition = getStepDefinition({
    selectedStepId,
    task,
    taskRun
  });

  const stepStatus = getStepStatus({
    selectedStepId,
    taskRun
  });

  const {
    reason: taskRunStatusReason,
    message: taskRunStatusMessage,
    status: succeeded
  } = getStatus(taskRun);

  const logContainer = getLogContainer({
    stepName: selectedStepId,
    stepStatus,
    taskRun
  });

  const onViewChange = getViewChangeHandler({ history, location });

  const rerun = !isReadOnly &&
    !taskRun.metadata?.labels?.['tekton.dev/pipeline'] && (
      <RunAction
        action="rerun"
        getURL={({ name, namespace: currentNamespace }) =>
          urls.taskRuns.byName({
            namespace: currentNamespace,
            taskRunName: name
          })
        }
        run={taskRun}
        runaction={rerunTaskRun}
        showNotification={setRerunNotification}
      />
    );

  let podDetails;
  if (!selectedStepId) {
    podDetails = (events || pod) && { events, resource: pod };
  }

  return (
    <>
      <div id="tkn--maximized-logs-container" ref={maximizedLogsContainer} />
      {rerunNotification && (
        <InlineNotification
          lowContrast
          actions={
            rerunNotification.logsURL ? (
              <Link
                className="bx--inline-notification__text-wrapper"
                to={rerunNotification.logsURL}
              >
                {intl.formatMessage({
                  id: 'dashboard.run.rerunStatusMessage',
                  defaultMessage: 'View status'
                })}
              </Link>
            ) : (
              ''
            )
          }
          title={rerunNotification.message}
          kind={rerunNotification.kind}
          caption=""
        />
      )}
      <RunHeader
        lastTransitionTime={taskRun.status?.startTime}
        loading={isLoadingTaskRun || isLoadingTask}
        message={taskRunStatusMessage}
        reason={taskRunStatusReason}
        runName={taskRun.metadata.name}
        status={succeeded}
      >
        {rerun}
      </RunHeader>
      <div className="tkn--tasks">
        <TaskTree
          onSelect={handleTaskSelected}
          selectedStepId={selectedStepId}
          selectedTaskId={showTaskRunDetails && taskRun.metadata.uid}
          taskRuns={[taskRun]}
        />
        {(selectedStepId && (
          <StepDetails
            definition={definition}
            logContainer={logContainer}
            onViewChange={onViewChange}
            showIO
            stepName={selectedStepId}
            stepStatus={stepStatus}
            taskRun={taskRun}
            view={view}
          />
        )) || (
          <TaskRunDetails
            onViewChange={onViewChange}
            pod={podDetails}
            task={task}
            taskRun={taskRun}
            view={view}
          />
        )}
      </div>
    </>
  );
}

export default injectIntl(TaskRunContainer);
