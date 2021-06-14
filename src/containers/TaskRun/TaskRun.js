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

import React, { useEffect, useRef, useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { InlineNotification, SkeletonText } from 'carbon-components-react';
import {
  Log,
  Portal,
  Rerun,
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
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';

import {
  getLogsRetriever,
  getLogsToolbar,
  getViewChangeHandler
} from '../../utils';

import {
  getSelectedNamespace,
  getTaskByType,
  getTaskRun,
  getTaskRunsErrorMessage,
  isWebSocketConnected
} from '../../reducers';

import {
  fetchTask as fetchTaskActionCreator,
  fetchTaskByType as fetchTaskByTypeActionCreator
} from '../../actions/tasks';
import { fetchTaskRun as fetchTaskRunActionCreator } from '../../actions/taskRuns';
import {
  rerunTaskRun,
  useExternalLogsURL,
  useIsLogStreamingEnabled,
  useIsReadOnly
} from '../../api';

const taskTypeKeys = { ClusterTask: 'clustertasks', Task: 'tasks' };
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

export /* istanbul ignore next */ function TaskRunContainer(props) {
  const {
    error,
    fetchTaskByType,
    fetchTaskRun,
    history,
    intl,
    location,
    match,
    namespace,
    selectedStepId,
    showTaskRunDetails,
    task,
    taskRun,
    view,
    webSocketConnected
  } = props;

  const { taskRunName } = match.params;

  const maximizedLogsContainer = useRef();
  const [isLogsMaximized, setIsLogsMaximized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rerunNotification, setRerunNotification] = useState(null);

  const externalLogsURL = useExternalLogsURL();
  const isLogStreamingEnabled = useIsLogStreamingEnabled();
  const isReadOnly = useIsReadOnly();

  useTitleSync({
    page: 'TaskRun',
    resourceName: taskRunName
  });

  function fetchTaskAndRuns() {
    fetchTaskRun({ name: taskRunName, namespace }).then(run => {
      if (run && run.spec.taskRef) {
        const { name, kind } = run.spec.taskRef;
        fetchTaskByType(name, taskTypeKeys[kind], namespace).then(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    fetchTaskAndRuns(taskRunName, namespace);
  }, [namespace, taskRunName]);

  useWebSocketReconnected(
    () => fetchTaskAndRuns(taskRunName, namespace),
    webSocketConnected
  );

  function toggleLogsMaximized() {
    setIsLogsMaximized(state => !state);
  }

  function getLogContainer({ stepName, stepStatus, taskRun: run }) {
    if (!selectedStepId || !stepStatus) {
      return null;
    }

    const logsRetriever = getLogsRetriever(
      isLogStreamingEnabled,
      externalLogsURL
    );

    const LogsRoot = isLogsMaximized ? Portal : React.Fragment;

    return (
      <LogsRoot
        {...(isLogsMaximized
          ? { container: maximizedLogsContainer.current }
          : null)}
      >
        <Log
          toolbar={getLogsToolbar({
            isMaximized: isLogsMaximized,
            stepStatus,
            taskRun: run,
            toggleMaximized: !!maximizedLogsContainer && toggleLogsMaximized
          })}
          fetchLogs={() => logsRetriever(stepName, stepStatus, run)}
          key={stepName}
          stepStatus={stepStatus}
        />
      </LogsRoot>
    );
  }

  function handleTaskSelected(_, newSelectedStepId) {
    const queryParams = new URLSearchParams(location.search);

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

    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  }

  if (loading) {
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

  const onViewChange = getViewChangeHandler(props);

  const rerun = !isReadOnly &&
    !taskRun.metadata?.labels?.['tekton.dev/pipeline'] && (
      <Rerun
        getURL={({ name, namespace: currentNamespace }) =>
          urls.taskRuns.byName({
            namespace: currentNamespace,
            taskRunName: name
          })
        }
        run={taskRun}
        rerun={rerunTaskRun}
        showNotification={setRerunNotification}
      />
    );

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
        loading={loading}
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
            task={task}
            taskRun={taskRun}
            view={view}
          />
        )}
      </div>
    </>
  );
}

TaskRunContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      taskRunName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace: namespaceParam, taskRunName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const selectedStepId = queryParams.get(STEP);
  const view = queryParams.get(VIEW);
  const showTaskRunDetails = queryParams.get(TASK_RUN_DETAILS);

  const namespace = namespaceParam || getSelectedNamespace(state);
  const taskRun = getTaskRun(state, {
    name: taskRunName,
    namespace
  });
  let task;
  if (taskRun && taskRun.spec.taskRef) {
    task = getTaskByType(state, {
      type: taskTypeKeys[taskRun.spec.taskRef.kind],
      name: taskRun.spec.taskRef.name,
      namespace
    });
  }
  return {
    error: getTaskRunsErrorMessage(state),
    namespace,
    selectedStepId,
    showTaskRunDetails,
    taskRun,
    task,
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTaskByType: fetchTaskByTypeActionCreator,
  fetchTask: fetchTaskActionCreator,
  fetchTaskRun: fetchTaskRunActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TaskRunContainer));
