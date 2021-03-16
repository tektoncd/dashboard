/*
Copyright 2020-2021 The Tekton Authors
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
import { getParams } from '@tektoncd/dashboard-utils';

import { DetailsHeader, Param, Tab, Table, Tabs, ViewYAML } from '..';

import './TaskRunDetails.scss';

function getDescriptions(array = []) {
  return array.reduce((accumulator, { name, description }) => {
    accumulator[name] = description;
    return accumulator;
  }, {});
}

const TaskRunDetails = ({ intl, onViewChange, task, taskRun, view }) => {
  const displayName = taskRun.metadata.name;
  const taskSpec = task?.spec || taskRun.spec.taskSpec;

  const paramsDescriptions = getDescriptions(taskSpec?.params);
  const resultsDescriptions = getDescriptions(taskSpec?.results);

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
    },
    {
      key: 'description',
      header: intl.formatMessage({
        id: 'dashboard.resourceDetails.description',
        defaultMessage: 'Description'
      })
    }
  ];

  const params = getParams(taskRun.spec);
  const paramsTable = params?.length ? (
    <Table
      size="short"
      headers={headers}
      rows={params.map(({ name, value }) => ({
        id: name,
        name,
        description: paramsDescriptions[name],
        value: (
          <span title={value}>
            <Param>{value}</Param>
          </span>
        )
      }))}
    />
  ) : null;

  const results = taskRun.status?.taskResults;
  const resultsTable = results?.length ? (
    <Table
      size="short"
      headers={headers}
      rows={results.map(({ name, value }) => ({
        id: name,
        name,
        description: resultsDescriptions[name],
        value: (
          <span title={value}>
            <Param>{value}</Param>
          </span>
        )
      }))}
    />
  ) : null;

  const tabs = [
    paramsTable && 'params',
    resultsTable && 'results',
    'status'
  ].filter(Boolean);

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  return (
    <div className="tkn--step-details">
      <DetailsHeader
        displayName={displayName}
        taskRun={taskRun}
        type="taskRun"
      />
      <Tabs
        aria-label="TaskRun details"
        onSelectionChange={index => onViewChange(tabs[index])}
        selected={selectedTabIndex}
      >
        {paramsTable && (
          <Tab
            id={`${displayName}-params`}
            label={intl.formatMessage({
              id: 'dashboard.taskRun.params',
              defaultMessage: 'Parameters'
            })}
          >
            <div className="tkn--step-status">{paramsTable}</div>
          </Tab>
        )}
        {resultsTable && (
          <Tab
            id={`${displayName}-results`}
            label={intl.formatMessage({
              id: 'dashboard.taskRun.results',
              defaultMessage: 'Results'
            })}
          >
            <div className="tkn--step-status">{resultsTable}</div>
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
            <ViewYAML
              resource={
                taskRun.status ||
                intl.formatMessage({
                  id: 'dashboard.taskRun.status.pending',
                  defaultMessage: 'Pending'
                })
              }
              dark
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

TaskRunDetails.propTypes = {
  onViewChange: PropTypes.func,
  task: PropTypes.shape({}),
  taskRun: PropTypes.shape({})
};

TaskRunDetails.defaultProps = {
  onViewChange: /* istanbul ignore next */ () => {},
  task: {},
  taskRun: {}
};

export default injectIntl(TaskRunDetails);
