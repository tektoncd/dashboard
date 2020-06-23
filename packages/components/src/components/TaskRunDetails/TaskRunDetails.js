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

import { DetailsHeader, Tab, Table, Tabs, ViewYAML, WithLineBreaks } from '..';

import './TaskRunDetails.scss';

const TaskRunDetails = props => {
  const { intl, taskRun } = props;

  const displayName = taskRun.pipelineTaskName || taskRun.taskRunName;

  const headers = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.taskRunParams.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'value',
      header: intl.formatMessage({
        id: 'dashboard.taskRunParams.value',
        defaultMessage: 'Value'
      })
    }
  ];

  const params = taskRun.params && taskRun.params.length && (
    <Table
      size="short"
      headers={headers}
      rows={taskRun.params.map(({ name, value }) => {
        return {
          id: name,
          name,
          value: (
            <span title={value}>
              <WithLineBreaks>{value}</WithLineBreaks>
            </span>
          )
        };
      })}
    />
  );

  return (
    <div className="tkn--step-details">
      <DetailsHeader stepName={displayName} taskRun={taskRun} type="taskRun" />
      <Tabs aria-label="TaskRun details">
        {params && (
          <Tab
            id={`${displayName}-details`}
            label={intl.formatMessage({
              id: 'dashboard.taskRun.params',
              defaultMessage: 'Parameters'
            })}
          >
            <div className="tkn--step-status">{params}</div>
          </Tab>
        )}
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

TaskRunDetails.defaultProps = {
  taskRun: {}
};

export default injectIntl(TaskRunDetails);
