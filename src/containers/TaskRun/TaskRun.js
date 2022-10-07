/*
Copyright 2019-2022 The Tekton Authors
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
import { useIntl } from 'react-intl';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { InlineNotification, SkeletonText } from 'carbon-components-react';
import {
  Actions,
  Log,
  Portal,
  RunHeader,
  StepDetails,
  TaskRunDetails,
  TaskTree
} from '@tektoncd/dashboard-components';
import {
  getStatus,
  getStepDefinition,
  getStepStatus,
  isRunning,
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
  cancelTaskRun,
  deleteTaskRun,
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
import { NotFound } from '..';

const { STEP, TASK_RUN_DETAILS, VIEW } = queryParamConstants;

export function TaskRunContainer() {
  const intl = useIntl();
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
  const [showNotification, setShowNotification] = useState(null);
  const [isUsingExternalLogs, setIsUsingExternalLogs] = useState(false);

  const externalLogsURL = useExternalLogsURL();
  const isLogStreamingEnabled = useIsLogStreamingEnabled();
  const isReadOnly = useIsReadOnly();

  useTitleSync({
    page: 'TaskRun',
    resourceName: taskRunName
  });

  const {
    data: taskRun,
    error,
    isLoading: isLoadingTaskRun
  } = useTaskRun({
    name: taskRunName,
    namespace
  });

  const { data: task, isInitialLoading: isLoadingTask } = useTaskByKind(
    {
      kind: taskRun?.spec.taskRef?.kind,
      name: taskRun?.spec.taskRef?.name,
      namespace
    },
    { enabled: !!taskRun?.spec.taskRef }
  );

  const podName = taskRun?.status?.podName;
  let { data: pod } = usePod(
    { name: podName, namespace },
    { enabled: !!podName && view === 'pod' }
  );

  if (!pod) {
    pod = intl.formatMessage({
      id: 'dashboard.pod.resource.empty',
      defaultMessage: 'Waiting for Pod resource'
    });
  }

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
    if (showTaskRunDetails || selectedStepId) {
      history.push(browserURL);
    } else {
      // auto-selecting step on first load
      history.replace(browserURL);
    }
  }

  function cancel() {
    cancelTaskRun({
      name: taskRun.metadata.name,
      namespace: taskRun.metadata.namespace
    });
  }

  function deleteTask() {
    deleteTaskRun({
      name: taskRun.metadata.name,
      namespace: taskRun.metadata.namespace
    })
      .then(() => {
        history.push(urls.taskRuns.byNamespace({ namespace }));
      })
      .catch(err => {
        err.response.text().then(text => {
          const statusCode = err.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setShowNotification({
            kind: 'error',
            message: errorMessage
          });
        });
      });
  }

  function rerun() {
    rerunTaskRun(taskRun)
      .then(newRun => {
        setShowNotification({
          kind: 'success',
          logsURL: urls.taskRuns.byName({
            namespace,
            taskRunName: newRun.metadata.name
          }),
          message: intl.formatMessage({
            id: 'dashboard.rerun.triggered',
            defaultMessage: 'Triggered rerun'
          })
        });
      })
      .catch(rerunError => {
        setShowNotification({
          kind: 'error',
          message: intl.formatMessage(
            {
              id: 'dashboard.rerun.error',
              defaultMessage:
                'An error occurred when rerunning {runName}: check the dashboard logs for details. Status code: {statusCode}'
            },
            {
              runName: taskRun.metadata.name,
              statusCode: rerunError.response.status
            }
          )
        });
      });
  }

  function taskRunActions() {
    if (isReadOnly) {
      return [];
    }
    return [
      {
        action: rerun,
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        disable: resource => !!resource.metadata.labels?.['tekton.dev/pipeline']
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelTaskRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.heading',
            defaultMessage: 'Stop TaskRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.primaryText',
            defaultMessage: 'Stop TaskRun'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to stop TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: deleteTask,
        danger: true,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        hasDivider: true,
        modalProperties: {
          danger: true,
          heading: intl.formatMessage(
            {
              id: 'dashboard.deleteResources.heading',
              defaultMessage: 'Delete {kind}'
            },
            { kind: 'TaskRun' }
          ),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to delete TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  }

  if (isLoadingTaskRun || isLoadingTask) {
    return <SkeletonText heading width="60%" />;
  }

  if (error || !taskRun) {
    return (
      <NotFound
        suggestions={[
          {
            text: 'TaskRuns',
            to: urls.taskRuns.byNamespace({ namespace })
          }
        ]}
      />
    );
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

  const runActions = taskRunActions();

  let podDetails;
  if (!selectedStepId) {
    podDetails = (events || pod) && { events, resource: pod };
  }

  return (
    <>
      <div id="tkn--maximized-logs-container" ref={maximizedLogsContainer} />
      {showNotification && (
        <InlineNotification
          lowContrast
          actions={
            showNotification.logsURL ? (
              <Link
                className="bx--inline-notification__text-wrapper"
                to={showNotification.logsURL}
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
          title={showNotification.message}
          kind={showNotification.kind}
          caption=""
        />
      )}
      <RunHeader
        lastTransitionTime={taskRun.status?.startTime}
        message={taskRunStatusMessage}
        reason={taskRunStatusReason}
        runName={taskRun.metadata.name}
        status={succeeded}
      >
        {runActions.length ? (
          <Actions items={runActions} kind="button" resource={taskRun} />
        ) : null}
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

export default TaskRunContainer;
