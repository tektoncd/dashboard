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

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { getStatus, getStepStatusReason } from '@tektoncd/dashboard-utils';

import { DetailsHeader, StepDefinition, StepStatus, Tab, Tabs } from '..';

const tabs = ['logs', 'status', 'details'];

const StepDetails = props => {
  const {
    definition,
    intl,
    logContainer,
    onViewChange,
    stepName,
    stepStatus,
    taskRun,
    view
  } = props;
  const { reason, status } = getStepStatusReason(stepStatus);
  const statusValue =
    getStatus(taskRun).reason === 'TaskRunCancelled' && status !== 'terminated'
      ? 'cancelled'
      : status;

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  return (
    <div className="tkn--step-details">
      <DetailsHeader
        displayName={stepName}
        reason={reason}
        status={statusValue}
        stepStatus={stepStatus}
        taskRun={taskRun}
      />
      <Tabs
        aria-label="Step details"
        onSelectionChange={index => onViewChange(tabs[index])}
        selected={selectedTabIndex}
      >
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
          <StepDefinition definition={definition} />
        </Tab>
      </Tabs>
    </div>
  );
};

StepDetails.propTypes = {
  onViewChange: PropTypes.func,
  taskRun: PropTypes.shape({})
};

StepDetails.defaultProps = {
  onViewChange: /* istanbul ignore next */ () => {},
  taskRun: {}
};

export default injectIntl(StepDetails);
