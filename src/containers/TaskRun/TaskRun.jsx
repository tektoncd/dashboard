/*
Copyright 2019-2025 The Tekton Authors
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

import { Fragment, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { InlineNotification, SkeletonText } from '@carbon/react';
import {
  ActionableNotification,
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
  labels as labelConstants,
  queryParams as queryParamConstants,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';

import LogsToolbar from '../LogsToolbar';
import { getLogsRetriever, getViewChangeHandler } from '../../utils';
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
  useTask,
  useTaskRun
} from '../../api';
import NotFound from '../NotFound';
import {
  getLogLevels,
  isLogTimestampsEnabled,
  setLogLevels,
  setLogTimestampsEnabled
} from '../../api/utils';

const { STEP, RETRY, TASK_RUN_DETAILS, VIEW } = queryParamConstants;

export function TaskRunContainer({
  // we may consider customisation of the log format in future
  showLogLevels = true
}) {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [logLevels, setLogLevelsState] = useState(getLogLevels());
  const [showTimestamps, setShowTimestamps] = useState(
    isLogTimestampsEnabled()
  );

  function onToggleLogLevel(logLevel) {
    setLogLevelsState(levels => {
      const newLevels = { ...levels, ...logLevel };
      setLogLevels(newLevels);
      return newLevels;
    });
  }

  function onToggleShowTimestamps(show) {
    setShowTimestamps(show);
    setLogTimestampsEnabled(show);
  }

  const { name, namespace: namespaceParam } = params;

  const queryParams = new URLSearchParams(location.search);
  let currentRetry = queryParams.get(RETRY);
  if (!currentRetry || !/^[0-9]+$/.test(currentRetry)) {
    // if retry param is specified it should contain a positive integer (or 0) only
    // otherwise we'll default to the latest attempt
    currentRetry = '';
  }
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
    resourceName: name
  });

  const {
    data: taskRun,
    error,
    isLoading: isLoadingTaskRun
  } = useTaskRun({
    name,
    namespace
  });

  const { data: task, isInitialLoading: isLoadingTask } = useTask(
    {
      name: taskRun?.spec.taskRef?.name,
      namespace
    },
    { enabled: !!taskRun?.spec.taskRef }
  );

  let podName = taskRun?.status?.podName;
  if (currentRetry !== '') {
    podName = taskRun?.status?.retriesStatus?.[currentRetry]?.podName;
  }
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

  function onToggleLogsMaximized() {
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

    const LogsRoot = isLogsMaximized ? Portal : Fragment;

    return (
      <LogsRoot
        {...(isLogsMaximized
          ? { container: maximizedLogsContainer.current }
          : null)}
      >
        <Log
          enableLogAutoScroll
          enableLogScrollButtons
          fetchLogs={() =>
            logsRetriever({ stepName, stepStatus, taskRun: run })
          }
          isLogsMaximized={isLogsMaximized}
          key={`${stepName}:${currentRetry}`}
          logLevels={logLevels}
          showLevels={showLogLevels}
          showTimestamps={showTimestamps}
          stepStatus={stepStatus}
          toolbar={
            <LogsToolbar
              externalLogsURL={externalLogsURL}
              id={`${podName}-${stepName}-logs-toolbar`}
              isMaximized={isLogsMaximized}
              isUsingExternalLogs={isUsingExternalLogs}
              logLevels={showLogLevels && logLevels}
              onToggleLogLevel={onToggleLogLevel}
              onToggleMaximized={
                !!maximizedLogsContainer && onToggleLogsMaximized
              }
              onToggleShowTimestamps={onToggleShowTimestamps}
              showTimestamps={showTimestamps}
              stepStatus={stepStatus}
              taskRun={run}
            />
          }
        />
      </LogsRoot>
    );
  }

  function handleRetryChange(retry) {
    if (Number.isInteger(retry)) {
      queryParams.set(RETRY, retry);
    } else {
      queryParams.delete(RETRY);
    }
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
  }

  function handleTaskSelected({ selectedStepId: newSelectedStepId }) {
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
      navigate(browserURL);
    } else {
      // auto-selecting step on first load
      navigate(browserURL, { replace: true });
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
        navigate(urls.taskRuns.byNamespace({ namespace }));
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
            name: newRun.metadata.name,
            namespace
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

  function editAndRun() {
    navigate(
      `${urls.taskRuns.create()}?mode=yaml&taskRunName=${
        taskRun.metadata.name
      }&namespace=${taskRun.metadata.namespace}`
    );
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
        action: editAndRun,
        actionText: intl.formatMessage({
          id: 'dashboard.editAndRun.actionText',
          defaultMessage: 'Edit and run'
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

  let taskRunToUse = taskRun;
  if (currentRetry !== '') {
    taskRunToUse = {
      ...taskRun,
      status: taskRun.status?.retriesStatus?.[currentRetry]
    };
  }

  const definition = getStepDefinition({
    selectedStepId,
    task,
    taskRun: taskRunToUse
  });

  const stepStatus = getStepStatus({
    selectedStepId,
    taskRun: taskRunToUse
  });

  const {
    reason: taskRunStatusReason,
    message: taskRunStatusMessage,
    status: succeeded
  } = getStatus(taskRunToUse);

  const logContainer = getLogContainer({
    stepName: selectedStepId,
    stepStatus,
    taskRun: taskRunToUse
  });

  const onViewChange = getViewChangeHandler({ location, navigate });

  const runActions = taskRunActions();

  let podDetails;
  if (!selectedStepId) {
    podDetails = (events || pod) && { events, resource: pod };
  }

  return (
    <>
      <div id="tkn--maximized-logs-container" ref={maximizedLogsContainer} />
      {showNotification?.logsURL && (
        <ActionableNotification
          inline
          kind={showNotification.kind}
          lowContrast
          title={showNotification.message}
        >
          <Link to={showNotification.logsURL}>
            {intl.formatMessage({
              id: 'dashboard.run.rerunStatusMessage',
              defaultMessage: 'View status'
            })}
          </Link>
        </ActionableNotification>
      )}
      {showNotification && !showNotification.logsURL && (
        <InlineNotification
          kind={showNotification.kind}
          lowContrast
          title={showNotification.message}
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
          onRetryChange={handleRetryChange}
          onSelect={handleTaskSelected}
          selectedRetry={currentRetry}
          selectedStepId={selectedStepId}
          selectedTaskId={
            taskRun.metadata.labels?.[labelConstants.PIPELINE_TASK]
          }
          taskRuns={[taskRun]}
        />
        {(selectedStepId && (
          <StepDetails
            definition={definition}
            logContainer={logContainer}
            onViewChange={onViewChange}
            stepName={selectedStepId}
            stepStatus={stepStatus}
            taskRun={taskRunToUse}
            view={view}
          />
        )) || (
          <TaskRunDetails
            onViewChange={onViewChange}
            pod={podDetails}
            task={task}
            taskRun={taskRunToUse}
            view={view}
          />
        )}
      </div>
    </>
  );
}

export default TaskRunContainer;
