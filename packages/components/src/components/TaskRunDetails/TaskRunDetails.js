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

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { DetailsHeader, Param, Tab, Table, Tabs, ViewYAML } from '..';

import './TaskRunDetails.scss';

const tabs = ['params', 'status'];

const TaskRunDetails = props => {
  const { intl, onViewChange, taskRun, view } = props;

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
              <Param>{value}</Param>
            </span>
          )
        };
      })}
    />
  );

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  return (
    <div className="tkn--step-details">
      <DetailsHeader stepName={displayName} taskRun={taskRun} type="taskRun" />
      <Tabs
        aria-label="TaskRun details"
        onSelectionChange={index => onViewChange(tabs[index])}
        selected={selectedTabIndex}
      >
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
            <ViewYAML resource={taskRun.status} dark />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

TaskRunDetails.propTypes = {
  onViewChange: PropTypes.func,
  taskRun: PropTypes.shape({})
};

TaskRunDetails.defaultProps = {
  onViewChange: /* istanbul ignore next */ () => {},
  taskRun: {}
};

export default injectIntl(TaskRunDetails);
