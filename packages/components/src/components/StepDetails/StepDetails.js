/*
Copyright 2019-2020 The Tekton Authors
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
import { DetailsHeader, StepDefinition, StepStatus, Tab, Tabs } from '..';

import './StepDetails.scss';

const tabs = ['logs', 'status', 'details'];

const StepDetails = props => {
  const {
    definition,
    intl,
    logContainer,
    onViewChange,
    reason,
    showIO,
    stepName,
    stepStatus,
    taskRun,
    view
  } = props;
  let { status } = props;
  status =
    taskRun.reason === 'TaskRunCancelled' && status !== 'terminated'
      ? 'cancelled'
      : status;

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  return (
    <div className="tkn--step-details">
      <DetailsHeader
        reason={reason}
        status={status}
        stepName={stepName}
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

StepDetails.propTypes = {
  onViewChange: PropTypes.func,
  showIO: PropTypes.bool,
  taskRun: PropTypes.shape({})
};

StepDetails.defaultProps = {
  onViewChange: /* istanbul ignore next */ () => {},
  showIO: false,
  taskRun: {}
};

export default injectIntl(StepDetails);
