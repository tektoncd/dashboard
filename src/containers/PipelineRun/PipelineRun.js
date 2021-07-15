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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PipelineRun, RunAction } from '@tektoncd/dashboard-components';
import {
  getTaskRunsWithPlaceholders,
  labels as labelConstants,
  pipelineRunStatuses,
  queryParams as queryParamConstants,
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import { isWebSocketConnected } from '../../reducers';
import {
  rerunPipelineRun,
  startPipelineRun,
  useClusterTasks,
  useExternalLogsURL,
  useIsLogStreamingEnabled,
  useIsReadOnly,
  usePipeline,
  usePipelineRun,
  useTaskRuns,
  useTasks
} from '../../api';

import {
  getLogsRetriever,
  getLogsToolbar,
  getViewChangeHandler
} from '../../utils';

const { PIPELINE_TASK, RETRY, STEP, VIEW } = queryParamConstants;

export /* istanbul ignore next */ function PipelineRunContainer(props) {
  const {
    history,
    intl,
    location,
    match,
    pipelineTaskName: currentPipelineTaskName,
    retry: currentRetry,
    selectedStepId: currentSelectedStepId,
    view,
    webSocketConnected
  } = props;

  const { namespace, pipelineRunName } = match.params;

  const maximizedLogsContainer = useRef();
  const [showRunActionNotification, setShowRunActionNotification] = useState(
    null
  );

  const externalLogsURL = useExternalLogsURL();
  const isLogStreamingEnabled = useIsLogStreamingEnabled();
  const isReadOnly = useIsReadOnly();

  useTitleSync({
    page: 'PipelineRun',
    resourceName: pipelineRunName
  });

  const {
    data: pipelineRun,
    error: pipelineRunError,
    isLoading: isLoadingPipelineRun,
    refetch: refetchPipelineRun
  } = usePipelineRun({ name: pipelineRunName, namespace });

  const {
    data: taskRunsResponse = [],
    error: taskRunsError,
    isLoading: isLoadingTaskRuns,
    refetch: refetchTaskRuns
  } = useTaskRuns({
    filters: [`${labelConstants.PIPELINE_RUN}=${pipelineRunName}`],
    namespace
  });

  // TODO: only request the Tasks / ClusterTasks we actually need
  const {
    data: tasks = [],
    error: tasksError,
    isLoading: isLoadingTasks,
    refetch: refetchTasks
  } = useTasks({ namespace });
  const {
    data: clusterTasks = [],
    isLoading: isLoadingClusterTasks,
    refetch: refetchClusterTasks
  } = useClusterTasks();

  const pipelineName = pipelineRun?.spec.pipelineRef?.name;
  const {
    data: pipeline,
    isLoading: isLoadingPipeline,
    refetch: refetchPipeline
  } = usePipeline(
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

  function refetchData() {
    refetchPipelineRun();
    refetchTaskRuns();
    refetchTasks();
    refetchClusterTasks();
    refetchPipeline();
  }

  useWebSocketReconnected(refetchData, webSocketConnected);

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

    return taskRun.metadata.uid + taskRun.status?.podName;
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
        uid
      };
      if (retriesStatus) {
        retriesStatus.forEach((retryStatus, index) => {
          acc[uid + retryStatus.podName] = {
            pipelineTaskName,
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
    const queryParams = new URLSearchParams(location.search);

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

    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  }

  if (!pipelineRun) {
    return (
      <PipelineRun
        error={intl.formatMessage({
          id: 'dashboard.pipelineRun.notFound',
          defaultMessage: 'PipelineRun not found'
        })}
        loading={false}
      />
    );
  }

  if (!pipelineRun.status) {
    pipelineRun.status = {
      taskRuns: []
    };
  }
  if (!pipelineRun.status.taskRuns) {
    pipelineRun.status.taskRuns = [];
  }

  const selectedTaskId = getSelectedTaskId(
    currentPipelineTaskName,
    currentRetry
  );

  let runAction = null;

  if (!isReadOnly) {
    if (pipelineRun.spec.status !== pipelineRunStatuses.PENDING) {
      runAction = (
        <RunAction
          action="rerun"
          getURL={({ name, namespace: resourceNamespace }) =>
            urls.pipelineRuns.byName({
              namespace: resourceNamespace,
              pipelineRunName: name
            })
          }
          run={pipelineRun}
          runaction={rerunPipelineRun}
          showNotification={value => setShowRunActionNotification(value)}
        />
      );
    } else {
      runAction = (
        <RunAction
          action="start"
          run={pipelineRun}
          runaction={startPipelineRun}
          showNotification={value => setShowRunActionNotification(value)}
        />
      );
    }
  }

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
        fetchLogs={getLogsRetriever(isLogStreamingEnabled, externalLogsURL)}
        handleTaskSelected={handleTaskSelected}
        loading={
          isLoadingPipelineRun ||
          isLoadingTaskRuns ||
          isLoadingTasks ||
          isLoadingClusterTasks ||
          isLoadingPipeline
        }
        getLogsToolbar={getLogsToolbar}
        maximizedLogsContainer={maximizedLogsContainer.current}
        onViewChange={getViewChangeHandler(props)}
        pipelineRun={pipelineRun}
        runaction={runAction}
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

PipelineRunContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      pipelineRunName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const pipelineTaskName = queryParams.get(PIPELINE_TASK);
  const retry = queryParams.get(RETRY);
  const selectedStepId = queryParams.get(STEP);
  const view = queryParams.get(VIEW);

  return {
    namespace,
    pipelineTaskName,
    retry,
    selectedStepId,
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(PipelineRunContainer));
