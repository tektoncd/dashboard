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

import React, { useEffect, useState } from 'react';
import {
  PendingFilled20 as DefaultIcon,
  ChevronDown20 as ExpandIcon
} from '@carbon/icons-react';
import { StatusIcon, Step } from '@tektoncd/dashboard-components';
import {
  getStepStatusReason,
  updateUnexecutedSteps
} from '@tektoncd/dashboard-utils';

function Task({
  expanded,
  selectDefaultStep,
  selectedStepId,
  steps,
  id,
  onSelect,
  displayName,
  reason,
  succeeded
}) {
  const [stepId, setStepId] = useState(null);

  function handleStepSelected(selectedStepId) {
    setStepId(selectedStepId);
    onSelect(id, selectedStepId);
  }

  function handleTaskSelected(event) {
    event?.preventDefault();
    setStepId(null);
    onSelect(id, null);
  }

  useEffect(() => {
    if (!selectDefaultStep) {
      return;
    }
    if (expanded && !selectedStepId) {
      const erroredStep = steps.find(
        step => step.terminated?.reason === 'Error' || !step.terminated
      );
      const { name } = erroredStep || steps[0] || {};
      handleStepSelected(name);
    }
  }, []);

  const expandIcon = expanded ? null : (
    <ExpandIcon className="tkn--task--expand-icon" />
  );

  return (
    <li
      className="tkn--task"
      data-succeeded={succeeded}
      data-reason={reason}
      data-selected={(expanded && !stepId) || undefined}
      data-active={expanded || undefined}
    >
      <a
        className="tkn--task-link"
        href="#"
        title={displayName}
        onClick={handleTaskSelected}
      >
        <StatusIcon
          DefaultIcon={DefaultIcon}
          reason={reason}
          status={succeeded}
        />
        <span className="tkn--task-link--name">{displayName}</span>
        {expandIcon}
      </a>
      {expanded && (
        <ol className="tkn--step-list">
          {updateUnexecutedSteps(steps).map(step => {
            const { name } = step;
            const { status, reason: stepReason } = getStepStatusReason(step);

            const selected = stepId === name;
            const stepStatus =
              reason === 'TaskRunCancelled' && status !== 'terminated'
                ? 'cancelled'
                : status;
            return (
              <Step
                id={name}
                key={name}
                onSelect={handleStepSelected}
                reason={stepReason}
                selected={selected}
                status={stepStatus}
                stepName={name}
              />
            );
          })}
        </ol>
      )}
    </li>
  );
}

Task.defaultProps = {
  steps: []
};

export default Task;
