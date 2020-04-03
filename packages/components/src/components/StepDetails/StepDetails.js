/*
Copyright 2019 The Tekton Authors
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

import { injectIntl } from 'react-intl';
import React from 'react';
import { StepDefinition, StepDetailsHeader, StepStatus, Tab, Tabs } from '..';

import './StepDetails.scss';

const StepDetails = props => {
  const {
    definition,
    intl,
    logContainer,
    reason,
    showIO,
    stepName,
    stepStatus,
    taskRun
  } = props;
  let { status } = props;
  status =
    taskRun.reason === 'TaskRunCancelled' && status !== 'terminated'
      ? 'cancelled'
      : status;
  return (
    <div className="step-details">
      <StepDetailsHeader
        reason={reason}
        status={status}
        stepName={stepName}
        taskRun={taskRun}
      />
      <Tabs aria-label="Step details">
        <Tab
          id={`${stepName}-logs`}
          label={intl.formatMessage({
            id: 'dashboard.taskRun.logs',
            defaultMessage: 'Logs'
          })}
        >
          {logContainer}
        </Tab>
        <Tab
          id={`${stepName}-status`}
          label={intl.formatMessage({
            id: 'dashboard.taskRun.status',
            defaultMessage: 'Status'
          })}
        >
          <StepStatus status={stepStatus} />
        </Tab>
        <Tab
          id={`${stepName}-details`}
          label={intl.formatMessage({
            id: 'dashboard.resource.detailsTab',
            defaultMessage: 'Details'
          })}
        >
          <StepDefinition
            definition={definition}
            showIO={showIO}
            taskRun={taskRun}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

StepDetails.defaultProps = {
  showIO: false,
  taskRun: {}
};

export default injectIntl(StepDetails);
