/*
Copyright 2024 The Tekton Authors
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

import { Fragment, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SkeletonText } from '@carbon/react';
import {
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
  labels as labelConstants,
  queryParams as queryParamConstants,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { getLogsToolbar, getViewChangeHandler } from '../../utils';
import { useTaskRunByResultsAPI } from '../../api/taskRunsByResultsAPI';
import { getLogByResultsAPI, useSelectedNamespace } from '../../api';
import NotFound from '../NotFound';

const { STEP, RETRY, TASK_RUN_DETAILS, VIEW } = queryParamConstants;

export function TaskRunContainerByResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const {
    namespace: namespaceParam,
    resultuid: resultUID,
    recorduid: recordUID
  } = params;
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
  const isUsingExternalLogs = false;

  const {
    data: record,
    error,
    isLoading
  } = useTaskRunByResultsAPI(namespace, resultUID, recordUID, {
    staleTime: 1000 // 1 second
  });

  const taskRun = record?.data?.value;

  useTitleSync({
    page: 'TaskRun by Results',
    resourceName: taskRun?.metadata?.name
  });

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

  function toggleLogsMaximized() {
    setIsLogsMaximized(state => !state);
  }

  function getLogContainer({ stepName, stepStatus, taskRun: run }) {
    if (!selectedStepId || !stepStatus) {
      return null;
    }

    // TODO(xinnjie): supporting Step level log, log provided by ResultsAPI is currently TaskRun level instead of Step level
    const log = getLogByResultsAPI({
      namespace,
      resultUID,
      recordUID
    });

    const LogsRoot = isLogsMaximized ? Portal : Fragment;

    return (
      <LogsRoot
        {...(isLogsMaximized
          ? { container: maximizedLogsContainer.current }
          : null)}
      >
        <Log
          // FIXME(xinnjie): log in toolbar is not from ResultsAPI yet
          toolbar={getLogsToolbar({
            isMaximized: isLogsMaximized,
            isUsingExternalLogs,
            stepStatus,
            taskRun: run,
            toggleMaximized: !!maximizedLogsContainer && toggleLogsMaximized
          })}
          fetchLogs={() => log}
          key={`${stepName}:${currentRetry}`}
          stepStatus={stepStatus}
          isLogsMaximized={isLogsMaximized}
          enableLogAutoScroll
          enableLogScrollButtons
        />
      </LogsRoot>
    );
  }

  if (isLoading) {
    return <SkeletonText heading width="60%" />;
  }

  if (error || !record || !taskRun) {
    return (
      <NotFound
        suggestions={[
          {
            text: 'TaskRuns by Results',
            to: urls.taskRunsByResults.byNamespace({ namespace })
          }
        ]}
      />
    );
  }

  const {
    reason: taskRunStatusReason,
    message: taskRunStatusMessage,
    status: succeeded
  } = getStatus(taskRun);

  const definition = getStepDefinition({
    selectedStepId,
    task: null,
    taskRun
  });

  const stepStatus = getStepStatus({
    selectedStepId,
    taskRun
  });

  const onViewChange = getViewChangeHandler({ location, navigate });

  const logContainer = getLogContainer({
    stepName: selectedStepId,
    stepStatus,
    taskRun
  });

  return (
    <>
      <RunHeader
        lastTransitionTime={taskRun.status?.startTime}
        message={taskRunStatusMessage}
        reason={taskRunStatusReason}
        runName={taskRun.metadata.name}
        status={succeeded}
      />
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
            taskRun={taskRun}
            view={view}
          />
        )) || (
          <TaskRunDetails
            onViewChange={onViewChange}
            // pod={podDetails}
            // task={task}
            taskRun={taskRun}
            view={view}
          />
        )}
      </div>
    </>
  );
}

export default TaskRunContainerByResults;
