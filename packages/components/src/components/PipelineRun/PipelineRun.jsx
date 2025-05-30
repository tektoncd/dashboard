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

import { Fragment, useState } from 'react';
import { InlineNotification, SkeletonText } from '@carbon/react';
import { useIntl } from 'react-intl';
import {
  getErrorMessage,
  getStatus,
  getStepDefinition,
  getStepStatus,
  labels as labelConstants
} from '@tektoncd/dashboard-utils';

import Log from '../Log';
import Portal from '../Portal';
import RunHeader from '../RunHeader';
import StepDetails from '../StepDetails';
import TaskRunDetails from '../TaskRunDetails';
import TaskTree from '../TaskTree';

function getPipelineTask({ pipeline, pipelineRun, selectedTaskId, taskRun }) {
  const memberOf = taskRun?.metadata?.labels?.[labelConstants.MEMBER_OF];
  const pipelineTask = (
    pipelineRun.spec?.pipelineSpec?.[memberOf] ||
    pipelineRun.status?.pipelineSpec?.[memberOf] ||
    pipeline?.spec?.[memberOf]
  )?.find(task => task.name === selectedTaskId);

  return pipelineTask;
}

export default /* istanbul ignore next */ function PipelineRun({
  customNotification,
  displayRunHeader,
  enableLogAutoScroll,
  enableLogScrollButtons,
  error,
  fetchLogs,
  forceLogPolling,
  getLogsToolbar,
  handleTaskSelected = /* istanbul ignore next */ () => {},
  handlePipelineRunInfo = () => {},
  loading,
  logLevels,
  maximizedLogsContainer,
  onRetryChange,
  onViewChange = /* istanbul ignore next */ () => {},
  pipeline,
  pipelineRun,
  pod,
  pollingInterval,
  runActions,
  selectedRetry,
  selectedStepId = null,
  selectedTaskId = null,
  selectedTaskRunName,
  showLogLevels,
  showLogTimestamps,
  taskRuns,
  tasks,
  labels = pipelineRun?.metadata?.labels,
  triggerHeader,
  view = null
}) {
  const intl = useIntl();
  const [isLogsMaximized, setIsLogsMaximized] = useState(false);

  const namespace = pipelineRun?.metadata?.namespace;
  const pipelineRefName =
    pipelineRun?.spec?.pipelineRef && pipelineRun?.spec?.pipelineRef?.name;

  function getPipelineRunError() {
    if (!pipelineRun.status?.taskRuns && !pipelineRun.status?.childReferences) {
      return null;
    }

    const {
      status: { childReferences, taskRuns: taskRunsStatus }
    } = pipelineRun;
    const { message, status, reason } = getStatus(pipelineRun);

    return (
      status === 'False' &&
      !taskRunsStatus &&
      !childReferences && { message, reason }
    );
  }

  function onToggleLogsMaximized() {
    setIsLogsMaximized(prevIsLogsMaximized => !prevIsLogsMaximized);
  }

  function getLogContainer({ stepName, stepStatus, taskRun }) {
    if (!selectedStepId || !stepStatus) {
      return null;
    }

    const LogsRoot =
      isLogsMaximized && maximizedLogsContainer ? Portal : Fragment;

    return (
      <LogsRoot
        {...(isLogsMaximized ? { container: maximizedLogsContainer } : null)}
      >
        <Log
          toolbar={
            getLogsToolbar &&
            stepStatus &&
            getLogsToolbar({
              id: `${selectedTaskId}-${selectedStepId}-${selectedRetry}-logs-toolbar`,
              isMaximized: isLogsMaximized,
              onToggleMaximized:
                !!maximizedLogsContainer && onToggleLogsMaximized,
              stepStatus,
              taskRun
            })
          }
          fetchLogs={() => fetchLogs({ stepName, stepStatus, taskRun })}
          forcePolling={forceLogPolling}
          key={`${selectedTaskId}:${selectedStepId}:${selectedRetry}`}
          logLevels={logLevels}
          pollingInterval={pollingInterval}
          stepStatus={stepStatus}
          isLogsMaximized={isLogsMaximized}
          enableLogAutoScroll={enableLogAutoScroll}
          enableLogScrollButtons={enableLogScrollButtons}
          showLevels={showLogLevels}
          showTimestamps={showLogTimestamps}
        />
      </LogsRoot>
    );
  }

  function loadTaskRuns() {
    if (
      !pipelineRun?.status?.taskRuns &&
      !pipelineRun?.status?.childReferences
    ) {
      return [];
    }

    return taskRuns || [];
  }

  function onTaskSelected({
    selectedRetry: retry,
    selectedStepId: stepId,
    selectedTaskId: taskId,
    taskRunName
  }) {
    const taskRunsToUse = loadTaskRuns();
    const taskRun =
      taskRunsToUse.find(
        ({ metadata }) =>
          metadata.labels?.[labelConstants.PIPELINE_TASK] === taskId
      ) || {};

    const pipelineTask = getPipelineTask({
      pipeline,
      pipelineRun,
      selectedTaskId: taskId,
      taskRun
    });
    handleTaskSelected({
      selectedRetry: retry,
      selectedStepId: stepId,
      selectedTaskId: taskId,
      taskRunName: pipelineTask?.matrix ? taskRunName : undefined
    });
  }

  if (loading) {
    return <SkeletonText heading width="60%" />;
  }

  if (error) {
    return (
      <>
        {customNotification}
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineRun.error',
            defaultMessage: 'Error loading PipelineRun'
          })}
          subtitle={getErrorMessage(error)}
        />
      </>
    );
  }

  if (!pipelineRun) {
    return (
      <>
        {customNotification}
        <InlineNotification
          kind="info"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineRun.failed',
            defaultMessage: 'Cannot load PipelineRun'
          })}
          subtitle={intl.formatMessage({
            id: 'dashboard.pipelineRun.notFound',
            defaultMessage: 'PipelineRun not found'
          })}
        />
      </>
    );
  }

  const pipelineRunName =
    pipelineRun.metadata.name || pipelineRun.metadata.generateName;
  const pipelineRunError = getPipelineRunError();

  const {
    lastTransitionTime,
    message: pipelineRunStatusMessage,
    reason: pipelineRunReason,
    status: pipelineRunStatus
  } = getStatus(pipelineRun);

  if (pipelineRun) {
    handlePipelineRunInfo({
      message: pipelineRunStatusMessage,
      name: pipelineRunName,
      reason: pipelineRunReason,
      status: pipelineRunStatus
    });
  }
  let triggerInfo = null;
  if (pipelineRun?.metadata) {
    triggerInfo = (
      <>
        {pipelineRun?.metadata?.labels?.['triggers.tekton.dev/eventlistener']}
        {pipelineRun?.metadata?.labels?.['triggers.tekton.dev/trigger']}
      </>
    );
  }
  if (pipelineRunError) {
    return (
      <>
        <RunHeader
          displayRunHeader={displayRunHeader}
          lastTransitionTime={lastTransitionTime}
          triggerInfo={triggerInfo}
          labels={labels}
          namespace={namespace}
          loading={loading}
          pipelineRun={pipelineRun}
          runName={pipelineRun.pipelineRunName}
          reason="Error"
          status={pipelineRunStatus}
          triggerHeader={triggerHeader}
        />
        {customNotification}
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage(
            {
              id: 'dashboard.pipelineRun.failedMessage',
              defaultMessage: 'Unable to load PipelineRun: {reason}'
            },
            { reason: pipelineRunError.reason }
          )}
          subtitle={pipelineRunError.message}
        />
      </>
    );
  }

  const taskRunsToUse = loadTaskRuns();
  let taskRun =
    taskRunsToUse.find(
      ({ metadata }) =>
        metadata.labels?.[labelConstants.PIPELINE_TASK] === selectedTaskId
    ) || {};

  const pipelineTask = getPipelineTask({
    pipeline,
    pipelineRun,
    selectedTaskId,
    taskRun
  });
  if (pipelineTask?.matrix && selectedTaskRunName) {
    taskRun = taskRunsToUse.find(
      ({ metadata }) => metadata.name === selectedTaskRunName
    );
  }

  if (taskRun.status?.retriesStatus && selectedRetry) {
    taskRun = {
      ...taskRun,
      status: taskRun.status.retriesStatus[selectedRetry]
    };
  }

  const task =
    (taskRun.spec?.taskRef?.name &&
      tasks?.find(t => t.metadata.name === taskRun.spec.taskRef.name)) ||
    {};

  const definition = getStepDefinition({
    selectedStepId,
    task,
    taskRun
  });

  const stepStatus = getStepStatus({
    selectedStepId,
    taskRun
  });

  const logContainer = getLogContainer({
    stepName: selectedStepId,
    stepStatus,
    taskRun
  });

  const skippedTasks = pipelineRun.status?.skippedTasks || [];
  const skippedTask = skippedTasks.find(
    skipped => skipped.name === selectedTaskId
  );

  return (
    <>
      <RunHeader
        pipelineRefName={pipelineRefName}
        displayRunHeader={displayRunHeader}
        lastTransitionTime={lastTransitionTime}
        triggerInfo={triggerInfo}
        labels={labels}
        namespace={namespace}
        loading={loading}
        message={pipelineRunStatusMessage}
        runName={pipelineRunName}
        reason={pipelineRunReason}
        status={pipelineRunStatus}
        triggerHeader={triggerHeader}
      >
        {runActions}
      </RunHeader>
      {customNotification}
      {taskRunsToUse.length > 0 && (
        <div className="tkn--tasks">
          <TaskTree
            isSelectedTaskMatrix={!!pipelineTask?.matrix}
            onRetryChange={onRetryChange}
            onSelect={onTaskSelected}
            selectedRetry={selectedRetry}
            selectedStepId={selectedStepId}
            selectedTaskId={selectedTaskId}
            selectedTaskRunName={selectedTaskRunName}
            skippedTasks={skippedTasks}
            taskRuns={taskRunsToUse}
          />
          {(selectedStepId && (
            <StepDetails
              definition={definition}
              logContainer={logContainer}
              onViewChange={onViewChange}
              skippedTask={skippedTask}
              stepName={selectedStepId}
              stepStatus={stepStatus}
              taskRun={taskRun}
              view={view}
            />
          )) ||
            (selectedTaskId && (
              <TaskRunDetails
                onViewChange={onViewChange}
                pod={pod}
                skippedTask={skippedTask}
                task={task}
                taskRun={taskRun}
                view={view}
              />
            ))}
        </div>
      )}
    </>
  );
}
