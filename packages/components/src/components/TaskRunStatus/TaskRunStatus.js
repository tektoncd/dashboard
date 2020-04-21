/*
Copyright 2020 The Tekton Authors
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
import { ChevronRight24 as ChevronRight } from '@carbon/icons-react';
import { Tab, Tabs, ViewYAML } from '..';

import './TaskRunStatus.scss';

const TaskRunStatus = props => {
  const { intl, taskRun } = props;

  const displayName = taskRun.pipelineTaskName || taskRun.taskRunName;

  return (
    <div className="tkn--step-details">
      <header className="tkn--step-details-header">
        <h2>
          <ChevronRight className="status-icon" />
          {displayName}
          <span className="status-label">
            {intl.formatMessage({
              id: 'dashboard.taskRun.status.notRun',
              defaultMessage: 'Not run'
            })}
          </span>
        </h2>
      </header>
      <Tabs aria-label="TaskRun details">
        <Tab
          id={`${displayName}-details`}
          label={intl.formatMessage({
            id: 'dashboard.taskRun.status',
            defaultMessage: 'Status'
          })}
        >
          <div className="tkn--step-status">
            <ViewYAML resource={taskRun.status} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

TaskRunStatus.defaultProps = {
  taskRun: {}
};

export default injectIntl(TaskRunStatus);
