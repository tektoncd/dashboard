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

import { useEffect, useRef, useState } from 'react';
import {
  ActionableNotification,
  Actions,
  PipelineRun
} from '@tektoncd/dashboard-components';
import {
  getStatus,
  getTaskRunsWithPlaceholders,
  isPending,
  isRunning,
  labels as labelConstants,
  preferences,
  queryParams as queryParamConstants,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { InlineNotification, RadioTile, TileGroup } from '@carbon/react';

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';

import LogsToolbar from '../LogsToolbar';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun,
  startPipelineRun,
  useEvents,
  useExternalLogsURL,
  useIsLogStreamingEnabled,
  useIsReadOnly,
  usePipeline,
  usePipelineRun,
  usePod,
  useTaskRuns,
  useTasks
} from '../../api';
import { getLogsRetriever, getViewChangeHandler } from '../../utils';
import NotFound from '../NotFound';
import {
  getLogLevels,
  isLogTimestampsEnabled,
  setLogLevels,
  setLogTimestampsEnabled
} from '../../api/utils';

const { PIPELINE_TASK, RETRY, STEP, TASK_RUN_NAME, VIEW } = queryParamConstants;

export /* istanbul ignore next */ function PipelineRunContainer({
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

  const { name, namespace } = params;

  const queryParams = new URLSearchParams(location.search);
  const currentPipelineTaskName = queryParams.get(PIPELINE_TASK);
  const currentTaskRunName = queryParams.get(TASK_RUN_NAME);

  let currentRetry = queryParams.get(RETRY);
  if (!currentRetry || !/^[0-9]+$/.test(currentRetry)) {
    // if retry param is specified it should contain a positive integer (or 0) only
    // otherwise we'll default to the latest attempt
    currentRetry = '';
  }

  const currentSelectedStepId = queryParams.get(STEP);
  const view = queryParams.get(VIEW);

  const maximizedLogsContainer = useRef();
  const [showRunActionNotification, setShowRunActionNotification] =
    useState(null);

  const externalLogsURL = useExternalLogsURL();
  const isLogStreamingEnabled = useIsLogStreamingEnabled();
  const isReadOnly = useIsReadOnly();
  const [isUsingExternalLogs, setIsUsingExternalLogs] = useState(false);
  const [cancelStatus, setCancelStatus] = useState('Cancelled');

  useTitleSync({
    page: 'PipelineRun',
    resourceName: name
  });

  useEffect(() => {
    const savedCancelStatus = localStorage.getItem(
      preferences.CANCEL_STATUS_KEY
    );
    if (savedCancelStatus) {
      setCancelStatus(savedCancelStatus);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(preferences.CANCEL_STATUS_KEY, cancelStatus);
  }, [cancelStatus]);

  const {
    data: pipelineRun,
    error: pipelineRunError,
    isLoading: isLoadingPipelineRun
  } = usePipelineRun({ name, namespace });

  const {
    data: taskRunsResponse = [],
    error: taskRunsError,
    isLoading: isLoadingTaskRuns
  } = useTaskRuns({
    filters: [`${labelConstants.PIPELINE_RUN}=${name}`],
    namespace
  });

  // TODO: only request the Tasks we actually need
  const {
    data: tasks = [],
    error: tasksError,
    isLoading: isLoadingTasks
  } = useTasks({ namespace });

  const pipelineName = pipelineRun?.spec.pipelineRef?.name;
  const { data: pipeline, isInitialLoading: isLoadingPipeline } = usePipeline(
    { name: pipelineName, namespace },
    { enabled: !!pipelineName }
  );

  const error = pipelineRunError || tasksError || taskRunsError;

  const taskRuns = getTaskRunsWithPlaceholders({
    pipeline,
    pipelineRun,
    taskRuns: taskRunsResponse,
    tasks
  });

  function getSelectedTaskRun({
    selectedRetry,
    selectedTaskId,
    selectedTaskRunName
  }) {
    const taskRun = taskRuns.find(({ metadata }) =>
      selectedTaskRunName
        ? metadata.name === selectedTaskRunName
        : metadata.labels?.[labelConstants.PIPELINE_TASK] === selectedTaskId
    );

    if (!taskRun) {
      return null;
    }

    if (selectedRetry === '') {
      return { podName: taskRun.status?.podName };
    }

    return { podName: taskRun.status?.retriesStatus?.[selectedRetry]?.podName };
  }

  function handleTaskSelected({
    selectedRetry: retry,
    selectedStepId,
    selectedTaskId,
    taskRunName
  }) {
    queryParams.set(PIPELINE_TASK, selectedTaskId);
    if (selectedStepId) {
      queryParams.set(STEP, selectedStepId);
    } else {
      queryParams.delete(STEP);
    }

    if (retry && /^[0-9]+$/.test(retry)) {
      queryParams.set(RETRY, retry);
    } else {
      queryParams.delete(RETRY);
    }

    if (taskRunName) {
      // matrix run
      queryParams.set(TASK_RUN_NAME, taskRunName);
    } else {
      queryParams.delete(TASK_RUN_NAME);
    }

    if (
      selectedStepId !== currentSelectedStepId ||
      selectedTaskId !== currentPipelineTaskName
    ) {
      queryParams.delete(VIEW);
    }

    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    if (currentPipelineTaskName) {
      navigate(browserURL);
    } else {
      // auto-selecting task & step on first load
      navigate(browserURL, { replace: true });
    }
  }

  function cancel() {
    // use value from localStorage to avoid stale value from closure
    const savedCancelStatus = localStorage.getItem(
      preferences.CANCEL_STATUS_KEY
    );
    cancelPipelineRun({
      name,
      namespace,
      status: savedCancelStatus
    }).catch(err => {
      err.response.text().then(text => {
        const statusCode = err.response.status;
        let errorMessage = `error code ${statusCode}`;
        if (text) {
          errorMessage = `${text} (error code ${statusCode})`;
        }
        setShowRunActionNotification({ kind: 'error', message: errorMessage });
      });
    });
  }

  function deleteRun() {
    deletePipelineRun({ name, namespace })
      .then(() => {
        navigate(urls.pipelineRuns.byNamespace({ namespace }));
      })
      .catch(err => {
        err.response.text().then(text => {
          const statusCode = err.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setShowRunActionNotification({
            kind: 'error',
            message: errorMessage
          });
        });
      });
  }

  function rerun() {
    rerunPipelineRun(pipelineRun)
      .then(newRun => {
        setShowRunActionNotification({
          kind: 'success',
          logsURL: urls.pipelineRuns.byName({
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
        setShowRunActionNotification({
          kind: 'error',
          message: intl.formatMessage(
            {
              id: 'dashboard.rerun.error',
              defaultMessage:
                'An error occurred when rerunning {runName}: check the dashboard logs for details. Status code: {statusCode}'
            },
            {
              runName: pipelineRun.metadata.name,
              statusCode: rerunError.response.status
            }
          )
        });
      });
  }

  function editAndRun() {
    navigate(
      `${urls.pipelineRuns.create()}?mode=yaml&pipelineRunName=${
        pipelineRun.metadata.name
      }&namespace=${pipelineRun.metadata.namespace}`
    );
  }

  function pipelineRunActions() {
    if (isReadOnly) {
      return [];
    }

    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        action: rerun,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isPending(reason, status);
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.editAndRun.actionText',
          defaultMessage: 'Edit and run'
        }),
        action: editAndRun
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.startPipelineRun.actionText',
          defaultMessage: 'Start'
        }),
        action: startPipelineRun,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isPending(reason, status);
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelPipelineRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status) && !isPending(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.heading',
            defaultMessage: 'Stop PipelineRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.primaryText',
            defaultMessage: 'Stop PipelineRun'
          }),
          body: resource => (
            <>
              <p>
                {intl.formatMessage(
                  {
                    id: 'dashboard.cancelPipelineRun.body',
                    defaultMessage:
                      'Are you sure you would like to stop PipelineRun {name}?'
                  },
                  { name: resource.metadata.name }
                )}
              </p>
              <TileGroup
                legend={intl.formatMessage({
                  id: 'dashboard.tableHeader.status',
                  defaultMessage: 'Status'
                })}
                name="cancelStatus-group"
                valueSelected={cancelStatus}
                onChange={status => setCancelStatus(status)}
              >
                <RadioTile name="cancelStatus" value="Cancelled">
                  <span>Cancelled</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.cancelled.description',
                      defaultMessage:
                        'Interrupt any currently executing tasks and skip finally tasks'
                    })}
                  </p>
                </RadioTile>
                <RadioTile name="cancelStatus" value="CancelledRunFinally">
                  <span>CancelledRunFinally</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.cancelledRunFinally.description',
                      defaultMessage:
                        'Interrupt any currently executing non-finally tasks, then execute finally tasks'
                    })}
                  </p>
                </RadioTile>
                <RadioTile name="cancelStatus" value="StoppedRunFinally">
                  <span>StoppedRunFinally</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.stoppedRunFinally.description',
                      defaultMessage:
                        'Allow any currently executing tasks to complete but do not schedule any new non-finally tasks, then execute finally tasks'
                    })}
                  </p>
                </RadioTile>
              </TileGroup>
            </>
          )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: deleteRun,
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
            { kind: 'PipelineRun' }
          ),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deletePipelineRun.body',
                defaultMessage:
                  'Are you sure you would like to delete PipelineRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  }

  const selectedTaskId = currentPipelineTaskName;

  const { podName } =
    getSelectedTaskRun({
      selectedRetry: currentRetry,
      selectedTaskId,
      selectedTaskRunName: currentTaskRunName
    }) || {};
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

  const isLoading =
    isLoadingPipelineRun ||
    isLoadingTaskRuns ||
    isLoadingTasks ||
    isLoadingPipeline;

  if (!isLoading && (pipelineRunError || !pipelineRun)) {
    return (
      <NotFound
        suggestions={[
          {
            text: 'PipelineRuns',
            to: urls.pipelineRuns.byNamespace({ namespace })
          }
        ]}
      />
    );
  }

  let podDetails;
  if (!currentSelectedStepId) {
    podDetails = (events || pod) && { events, resource: pod };
  }

  const runActions = pipelineRunActions();

  return (
    <>
      <div id="tkn--maximized-logs-container" ref={maximizedLogsContainer} />
      {showRunActionNotification?.logsURL && (
        <ActionableNotification
          inline
          kind={showRunActionNotification.kind}
          lowContrast
          title={showRunActionNotification.message}
        >
          <Link to={showRunActionNotification.logsURL}>
            {intl.formatMessage({
              id: 'dashboard.run.rerunStatusMessage',
              defaultMessage: 'View status'
            })}
          </Link>
        </ActionableNotification>
      )}
      {showRunActionNotification && !showRunActionNotification.logsURL && (
        <InlineNotification
          kind={showRunActionNotification.kind}
          lowContrast
          title={showRunActionNotification.message}
        />
      )}
      <PipelineRun
        enableLogAutoScroll
        enableLogScrollButtons
        error={error}
        fetchLogs={getLogsRetriever({
          externalLogsURL,
          isLogStreamingEnabled,
          onFallback: setIsUsingExternalLogs
        })}
        handleTaskSelected={handleTaskSelected}
        loading={isLoading}
        logLevels={logLevels}
        getLogsToolbar={toolbarProps => (
          <LogsToolbar
            {...toolbarProps}
            externalLogsURL={externalLogsURL}
            isUsingExternalLogs={isUsingExternalLogs}
            logLevels={showLogLevels && logLevels}
            onToggleLogLevel={onToggleLogLevel}
            onToggleShowTimestamps={onToggleShowTimestamps}
            showTimestamps={showTimestamps}
          />
        )}
        maximizedLogsContainer={maximizedLogsContainer.current}
        onRetryChange={retry => {
          if (Number.isInteger(retry)) {
            queryParams.set(RETRY, retry);
          } else {
            queryParams.delete(RETRY);
          }
          const browserURL = location.pathname.concat(
            `?${queryParams.toString()}`
          );
          navigate(browserURL);
        }}
        onViewChange={getViewChangeHandler({ location, navigate })}
        pipelineRun={pipelineRun}
        pod={podDetails}
        runActions={
          runActions.length ? (
            <Actions items={runActions} kind="button" resource={pipelineRun} />
          ) : null
        }
        selectedRetry={currentRetry}
        selectedStepId={currentSelectedStepId}
        selectedTaskId={selectedTaskId}
        selectedTaskRunName={currentTaskRunName}
        showLogLevels={showLogLevels}
        showLogTimestamps={showTimestamps}
        taskRuns={taskRuns}
        tasks={tasks}
        view={view}
      />
    </>
  );
}

export default PipelineRunContainer;
