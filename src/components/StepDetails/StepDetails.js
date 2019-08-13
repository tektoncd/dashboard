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
import { Tab, Tabs } from 'carbon-components-react';
import { StepDetailsHeader, StepStatus } from '@tektoncd/dashboard-components';

import Log from '../../containers/Log';
import StepDefinition from '../StepDefinition';

import './StepDetails.scss';

const StepDetails = props => {
  const {
    definition,
    intl,
    reason,
    status,
    stepName,
    stepStatus,
    taskRun
  } = props;
  const { pod } = taskRun;
  return (
    <div className="step-details">
      <StepDetailsHeader
        reason={reason}
        status={status}
        stepName={stepName}
        taskRun={taskRun}
      />
      <Tabs>
        <Tab
          className="details-tab"
          label={intl.formatMessage({
            id: 'dashboard.taskRun.logs',
            defaultMessage: 'Logs'
          })}
        >
          <Log
            key={stepName}
            stepName={stepName}
            podName={pod}
            stepStatus={stepStatus}
            namespace={taskRun.namespace}
          />
        </Tab>
        <Tab
          className="details-tab"
          label={intl.formatMessage({
            id: 'dashboard.taskRun.status',
            defaultMessage: 'Status'
          })}
        >
          <StepStatus status={stepStatus} />
        </Tab>
        <Tab
          className="details-tab"
          label={intl.formatMessage({
            id: 'dashboard.taskRun.details',
            defaultMessage: 'Details'
          })}
        >
          <StepDefinition definition={definition} taskRun={taskRun} />
        </Tab>
      </Tabs>
    </div>
  );
};

StepDetails.defaultProps = {
  taskRun: {}
};

export default injectIntl(StepDetails);
