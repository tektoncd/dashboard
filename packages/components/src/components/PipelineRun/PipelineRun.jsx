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
import { InlineNotification, SkeletonText, TabsVertical } from '@carbon/react';
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
import TaskRunTabPanels from '../TaskRunTabPanels';
import TaskRunTabs from '../TaskRunTabs';
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
  description,
  displayRunHeader,
  duration,
  enableLogAutoScroll,
  enableLogScrollButtons,
  enableTabLayout,
  error,
  fetchLogs,
  forceLogPolling,
  getLogsToolbar,
  handlePipelineRunInfo = () => {},
  handleTaskSelected = /* istanbul ignore next */ () => {},
  loading,
  logLevels,
  maximizedLogsContainer,
  onRetryChange,
  onViewChange = /* istanbul ignore next */ () => {},
  pipeline,
  pipelineRun,
  pod,
  pollingInterval,
  preTaskRun,
  runActions,
  selectedRetry,
  selectedStepId = null,
  selectedTaskId = null,
  selectedTaskRunName,
  showLogLevels,
  showLogTimestamps,
  taskRuns,
  tasks,
  triggerHeader,
  view = null
}) {
  const intl = useIntl();
  const [isLogsMaximized, setIsLogsMaximized] = useState(false);
  const [isTaskRunMaximized, setIsTaskRunMaximized] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(() =>
    selectedStepId ? { [selectedStepId]: true } : {}
  );
  const namespace = pipelineRun?.metadata?.namespace;
  const pipelineRefName =
    pipelineRun?.spec?.pipelineRef && pipelineRun?.spec?.pipelineRef?.name;

  function showPipelineRunError() {
    if (!pipelineRun.status?.taskRuns && !pipelineRun.status?.childReferences) {
      return null;
    }

    const {
      status: { childReferences, taskRuns: taskRunsStatus }
    } = pipelineRun;
    const { status } = getStatus(pipelineRun);

    return status === 'False' && !taskRunsStatus && !childReferences;
  }

  function showRunFailureMessage() {
    const { status, reason } = getStatus(pipelineRun);
    return status === 'False' && reason !== 'Cancelled';
  }

  function onToggleLogsMaximized() {
    setIsLogsMaximized(prevIsLogsMaximized => !prevIsLogsMaximized);
  }

  function onToggleTaskRunMaximized() {
    setIsTaskRunMaximized(prevIsTaskRunMaximized => !prevIsTaskRunMaximized);
  }

  function getLogContainer({
    disableLogsToolbar,
    isSidecar,
    stepName,
    stepStatus,
    taskRun
  }) {
    if ((!selectedStepId && !stepName) || !stepStatus) {
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
            !disableLogsToolbar &&
            getLogsToolbar &&
            stepStatus &&
            getLogsToolbar({
              id: `${selectedTaskId}-${stepName}-${selectedRetry}-logs-toolbar`,
              isMaximized: isLogsMaximized,
              onToggleMaximized:
                !!maximizedLogsContainer && onToggleLogsMaximized,
              stepStatus,
              taskRun
            })
          }
          fetchLogs={() => fetchLogs({ stepName, stepStatus, taskRun })}
          forcePolling={forceLogPolling}
          isSidecar={isSidecar}
          key={`${selectedTaskId}:${stepName}:${selectedRetry}`}
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

  function onStepSelected({
    isOpen,
    selectedRetry: retry,
    selectedStepId: stepId,
    selectedTaskId: taskId,
    taskRunName
  }) {
    setExpandedSteps(currentExpandedSteps => ({
      ...currentExpandedSteps,
      [stepId]: isOpen
    }));
    if (isOpen) {
      onTaskSelected({
        selectedRetry: retry,
        selectedStepId: stepId,
        selectedTaskId: taskId,
        taskRunName
      });
    }
  }

  if (loading) {
    return <SkeletonText heading width="60%" />;
  }

  if (error) {
    return (
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
    );
  }

  if (!pipelineRun) {
    return (
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
    );
  }

  const pipelineRunName =
    pipelineRun.metadata.name || pipelineRun.metadata.generateName;
  const pipelineRunError = showPipelineRunError();
  const showFailureMessage = showRunFailureMessage();

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

  if (pipelineRun?.metadata?.labels) {
    const eventListener =
      pipelineRun.metadata.labels[labelConstants.EVENT_LISTENER];
    const trigger = pipelineRun.metadata.labels[labelConstants.TRIGGER];

    if (eventListener || trigger) {
      triggerInfo = (
        <span
          className="tkn--triggerInfo"
          title={`EventListener: ${eventListener || '-'}\nTrigger: ${
            trigger || '-'
          }`}
        >
          {eventListener && <div>{eventListener}</div>}
          {trigger && <div>{trigger}</div>}
        </span>
      );
    }
  }

  const taskRunsToUse = loadTaskRuns();
  let taskRunIndex = taskRunsToUse.findIndex(
    ({ metadata }) =>
      metadata.labels?.[labelConstants.PIPELINE_TASK] === selectedTaskId
  );
  let taskRun = taskRunsToUse[taskRunIndex] || {};

  const pipelineTask = getPipelineTask({
    pipeline,
    pipelineRun,
    selectedTaskId,
    taskRun
  });

  if (pipelineTask?.matrix && selectedTaskRunName) {
    taskRunIndex = taskRunsToUse.findIndex(
      ({ metadata }) => metadata.name === selectedTaskRunName
    );
    taskRun = taskRunsToUse[taskRunIndex] || {};
  }

  const preTaskRunOffset = preTaskRun ? 0 : 1;
  const selectedIndex =
    taskRunIndex !== -1 ? taskRunIndex + preTaskRunOffset : preTaskRunOffset;

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

  const stepStatus = getStepStatus({
    selectedStepId,
    taskRun
  });

  let definition;
  let logContainer;
  if (!enableTabLayout) {
    definition = getStepDefinition({
      selectedStepId,
      task,
      taskRun
    });

    logContainer = getLogContainer({
      stepName: selectedStepId,
      stepStatus,
      taskRun
    });
  }

  const skippedTasks = pipelineRun.status?.skippedTasks || [];
  const skippedTask = skippedTasks.find(
    skipped => skipped.name === selectedTaskId
  );

  if (enableTabLayout && !selectedTaskId) {
    const selectedTaskRun = taskRunsToUse[0];
    const { labels = {} } = selectedTaskRun?.metadata || {};
    const { [labelConstants.PIPELINE_TASK]: pipelineTaskName } = labels;

    onTaskSelected({
      selectedTaskId: pipelineTaskName,
      taskRunName: selectedTaskRun?.metadata?.name
    });
  }

  return (
    <>
      <RunHeader
        description={description}
        pipelineRefName={pipelineRefName}
        pipelineRunError={pipelineRunError}
        showFailureMessage={showFailureMessage}
        displayRunHeader={displayRunHeader}
        duration={duration}
        lastTransitionTime={lastTransitionTime}
        triggerInfo={triggerInfo}
        resource={pipelineRun}
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
      {(taskRunsToUse.length > 0 || preTaskRun) && (
        <div className="tkn--tasks">
          {enableTabLayout ? (
            <TabsVertical
              selectedIndex={selectedIndex}
              onChange={({ selectedIndex: newSelectedIndex }) => {
                if (preTaskRun && newSelectedIndex === 0) {
                  onTaskSelected({});
                  return;
                }

                const selectedTaskRun =
                  taskRunsToUse[newSelectedIndex - preTaskRunOffset];
                const { labels } = selectedTaskRun.metadata;
                const { [labelConstants.PIPELINE_TASK]: pipelineTaskName } =
                  labels;

                setExpandedSteps({});
                onTaskSelected({
                  selectedTaskId: pipelineTaskName,
                  taskRunName: selectedTaskRun.metadata?.name
                });
              }}
            >
              <TaskRunTabs
                preTaskRun={preTaskRun}
                skippedTasks={skippedTasks}
                taskRuns={taskRunsToUse}
              />
              <TaskRunTabPanels
                expandedSteps={expandedSteps}
                getLogContainer={getLogContainer}
                getLogsToolbar={getLogsToolbar}
                isMaximized={isTaskRunMaximized}
                onRetryChange={onRetryChange}
                onStepSelected={onStepSelected}
                onToggleMaximized={onToggleTaskRunMaximized}
                onViewChange={onViewChange}
                pod={pod}
                preTaskRun={preTaskRun}
                selectedIndex={selectedIndex}
                selectedRetry={selectedRetry}
                selectedTaskId={selectedTaskId}
                selectedStepId={selectedStepId}
                skippedTask={skippedTask}
                task={task}
                taskRun={taskRun}
                taskRuns={taskRunsToUse}
                view={view}
              />
            </TabsVertical>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </>
  );
}
