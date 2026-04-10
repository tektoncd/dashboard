/*
Copyright 2025-2026 The Tekton Authors
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

import {
  TabPanel as CarbonTabPanel,
  TabPanels as CarbonTabPanels
} from '@carbon/react';

import TaskRunDetails from '../TaskRunDetails';
import TaskRunLogs from '../TaskRunLogs';

const TaskRunTabPanels = ({
  expandedSteps,
  getLogContainer,
  getLogsToolbar,
  ignoredSidecars = {},
  isMaximized,
  onRetryChange,
  onStepSelected,
  onToggleMaximized,
  onViewChange,
  pod,
  preTaskRun,
  selectedIndex,
  selectedRetry,
  selectedStepId,
  selectedTaskId,
  skippedTask,
  TabPanel = CarbonTabPanel,
  TabPanels = CarbonTabPanels,
  task,
  taskRun: taskRunToUse,
  taskRuns,
  view
}) => {
  const logs = (
    <TaskRunLogs
      expandedSteps={expandedSteps}
      getLogContainer={getLogContainer}
      ignoredSidecars={ignoredSidecars}
      onStepSelected={onStepSelected}
      selectedRetry={selectedRetry}
      selectedTaskId={selectedTaskId}
      skippedTask={skippedTask}
      task={task}
      taskRun={taskRunToUse}
    />
  );

  return (
    <TabPanels>
      {/* only render panel content when active */}
      {preTaskRun ? (
        <TabPanel>{selectedIndex === 0 ? preTaskRun.content : null}</TabPanel>
      ) : null}
      {taskRuns.map((taskRun, index) => (
        <TabPanel key={taskRun.metadata?.uid || index}>
          {selectedIndex === index + 1 ? (
            <TaskRunDetails
              fullTaskRun={taskRun}
              getLogsToolbar={getLogsToolbar}
              isMaximized={isMaximized}
              logs={logs}
              onRetryChange={onRetryChange}
              onToggleMaximized={onToggleMaximized}
              onViewChange={onViewChange}
              pod={pod}
              selectedRetry={selectedRetry}
              selectedStepId={selectedStepId}
              skippedTask={skippedTask}
              task={task}
              taskRun={taskRunToUse} // may include additional matrix / retry data
              view={view}
            />
          ) : null}
        </TabPanel>
      ))}
    </TabPanels>
  );
};

export default TaskRunTabPanels;
