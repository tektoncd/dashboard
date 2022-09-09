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

import React, { useEffect, useRef, useState } from 'react';
import { Actions, PipelineRun } from '@tektoncd/dashboard-components';
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
import {
  InlineNotification,
  RadioTile,
  TileGroup
} from 'carbon-components-react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun,
  startPipelineRun,
  useClusterTasks,
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

import {
  getLogsRetriever,
  getLogsToolbar,
  getViewChangeHandler
} from '../../utils';

const { PIPELINE_TASK, RETRY, STEP, VIEW } = queryParamConstants;

export /* istanbul ignore next */ function PipelineRunContainer({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();

  const { namespace, pipelineRunName } = params;

  const queryParams = new URLSearchParams(location.search);
  const currentPipelineTaskName = queryParams.get(PIPELINE_TASK);
  const currentRetry = queryParams.get(RETRY);
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
    resourceName: pipelineRunName
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
  } = usePipelineRun({ name: pipelineRunName, namespace });

  const {
    data: taskRunsResponse = [],
    error: taskRunsError,
    isLoading: isLoadingTaskRuns
  } = useTaskRuns({
    filters: [`${labelConstants.PIPELINE_RUN}=${pipelineRunName}`],
    namespace
  });

  // TODO: only request the Tasks / ClusterTasks we actually need
  const {
    data: tasks = [],
    error: tasksError,
    isLoading: isLoadingTasks
  } = useTasks({ namespace });
  const { data: clusterTasks = [], isLoading: isLoadingClusterTasks } =
    useClusterTasks({});

  const pipelineName = pipelineRun?.spec.pipelineRef?.name;
  const { data: pipeline, isLoading: isLoadingPipeline } = usePipeline(
    { name: pipelineName, namespace },
    { enabled: !!pipelineName }
  );

  const error = pipelineRunError || tasksError || taskRunsError;

  const taskRuns = getTaskRunsWithPlaceholders({
    clusterTasks,
    pipeline,
    pipelineRun,
    taskRuns: taskRunsResponse,
    tasks
  });

  function getSelectedTaskId(pipelineTaskName, retry) {
    const taskRun = taskRuns.find(
      ({ metadata }) =>
        metadata.labels &&
        ((metadata.labels[labelConstants.CONDITION_CHECK] &&
          metadata.labels[labelConstants.CONDITION_CHECK] ===
            pipelineTaskName) ||
          // the `pipelineTask` label is present on both TaskRuns (the owning
          // TaskRun and the TaskRun created for the condition check), ensure
          // we only match on the owning TaskRun here and not another condition
          (!metadata.labels[labelConstants.CONDITION_CHECK] &&
            metadata.labels[labelConstants.PIPELINE_TASK] === pipelineTaskName))
    );

    if (!taskRun) {
      return null;
    }

    const retryNumber = parseInt(retry, 10);
    if (!Number.isNaN(retryNumber) && taskRun.status?.retriesStatus) {
      const retryStatus = taskRun.status.retriesStatus[retryNumber];
      return retryStatus && taskRun.metadata.uid + retryStatus.podName;
    }

    return taskRun.metadata.uid + taskRun.status?.podName; // eslint-disable-line no-unsafe-optional-chaining
  }

  function getSelectedTaskRun(selectedTaskId) {
    const lookup = taskRuns.reduce((acc, taskRun) => {
      const { labels, uid } = taskRun.metadata;
      const pipelineTaskName =
        labels &&
        (labels[labelConstants.CONDITION_CHECK] ||
          labels[labelConstants.PIPELINE_TASK]);
      const { podName, retriesStatus } = taskRun.status || {};
      acc[uid + podName] = {
        pipelineTaskName,
        podName,
        uid
      };
      if (retriesStatus) {
        retriesStatus.forEach((retryStatus, index) => {
          acc[uid + retryStatus.podName] = {
            pipelineTaskName,
            podName: retryStatus.podName,
            retry: index,
            uid
          };
        });
      }
      return acc;
    }, {});
    return lookup[selectedTaskId];
  }

  function handleTaskSelected(selectedTaskId, selectedStepId) {
    const { pipelineTaskName, retry } = getSelectedTaskRun(selectedTaskId);

    queryParams.set(PIPELINE_TASK, pipelineTaskName);
    if (selectedStepId) {
      queryParams.set(STEP, selectedStepId);
    } else {
      queryParams.delete(STEP);
    }

    if (Number.isInteger(retry)) {
      queryParams.set(RETRY, retry);
    } else {
      queryParams.delete(RETRY);
    }

    const currentTaskId = getSelectedTaskId(
      currentPipelineTaskName,
      currentRetry
    );
    if (
      selectedStepId !== currentSelectedStepId ||
      selectedTaskId !== currentTaskId
    ) {
      queryParams.delete(VIEW);
    }

    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    if (currentPipelineTaskName) {
      history.push(browserURL);
    } else {
      // auto-selecting task & step on first load
      history.replace(browserURL);
    }
  }

  function cancel() {
    // use value from localStorage to avoid stale value from closure
    const savedCancelStatus = localStorage.getItem(
      preferences.CANCEL_STATUS_KEY
    );
    const { name, namespace: resourceNamespace } = pipelineRun.metadata;
    cancelPipelineRun({
      name,
      namespace: resourceNamespace,
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
    const { name, namespace: resourceNamespace } = pipelineRun.metadata;
    deletePipelineRun({ name, namespace: resourceNamespace })
      .then(() => {
        history.push(urls.pipelineRuns.byNamespace({ namespace }));
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
            namespace,
            pipelineRunName: newRun.metadata.name
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
                <RadioTile light name="cancelStatus" value="Cancelled">
                  <span>Cancelled</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.cancelled.description',
                      defaultMessage:
                        'Interrupt any currently executing tasks and skip finally tasks'
                    })}
                  </p>
                </RadioTile>
                <RadioTile
                  light
                  name="cancelStatus"
                  value="CancelledRunFinally"
                >
                  <span>CancelledRunFinally</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.cancelledRunFinally.description',
                      defaultMessage:
                        'Interrupt any currently executing non-finally tasks, then execute finally tasks'
                    })}
                  </p>
                </RadioTile>
                <RadioTile light name="cancelStatus" value="StoppedRunFinally">
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

  const selectedTaskId = getSelectedTaskId(
    currentPipelineTaskName,
    currentRetry
  );

  const { podName } = getSelectedTaskRun(selectedTaskId) || {};
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

  let podDetails;
  if (!currentSelectedStepId) {
    podDetails = (events || pod) && { events, resource: pod };
  }

  const runActions = pipelineRunActions();

  return (
    <>
      <div id="tkn--maximized-logs-container" ref={maximizedLogsContainer} />
      {showRunActionNotification && (
        <InlineNotification
          lowContrast
          actions={
            showRunActionNotification.logsURL ? (
              <Link
                className="bx--inline-notification__text-wrapper"
                to={showRunActionNotification.logsURL}
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
          title={showRunActionNotification.message}
          kind={showRunActionNotification.kind}
          caption=""
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
        loading={
          isLoadingPipelineRun ||
          isLoadingTaskRuns ||
          isLoadingTasks ||
          isLoadingClusterTasks ||
          isLoadingPipeline
        }
        getLogsToolbar={toolbarParams =>
          getLogsToolbar({
            ...toolbarParams,
            externalLogsURL,
            isUsingExternalLogs
          })
        }
        maximizedLogsContainer={maximizedLogsContainer.current}
        onViewChange={getViewChangeHandler({ history, location })}
        pipelineRun={pipelineRun}
        pod={podDetails}
        runActions={
          runActions.length ? (
            <Actions items={runActions} kind="button" resource={pipelineRun} />
          ) : null
        }
        selectedStepId={currentSelectedStepId}
        selectedTaskId={selectedTaskId}
        showIO
        taskRuns={taskRuns}
        tasks={tasks.concat(clusterTasks)}
        view={view}
      />
    </>
  );
}

export default injectIntl(PipelineRunContainer);
