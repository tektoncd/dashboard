/*
Copyright 2020-2024 The Tekton Authors
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

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { getParams, taskRunHasWarning } from '@tektoncd/dashboard-utils';
import {
  ContentSwitcher,
  Switch,
  TabList,
  TabPanel,
  TabPanels,
  Tooltip
} from '@carbon/react';
import { Information } from '@carbon/react/icons';

import DetailsHeader from '../DetailsHeader';
import Param from '../Param';
import Tab from '../Tab';
import Table from '../Table';
import Tabs from '../Tabs';
import ViewYAML from '../ViewYAML';

function HelpIcon({ title }) {
  if (!title) {
    return null;
  }

  return (
    <Tooltip align="top-end" autoAlign label={title}>
      {/* false positive, Carbon automatically adds aria-labelledby to the button */}
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button className="tkn--tooltip-trigger" type="button">
        <Information />
      </button>
    </Tooltip>
  );
}

function getDescriptions(array) {
  if (!array) {
    return {};
  }

  return array.reduce((accumulator, { name, description }) => {
    accumulator[name] = description;
    return accumulator;
  }, {});
}

const defaults = {
  onViewChange: /* istanbul ignore next */ () => {},
  task: {},
  taskRun: {}
};

const TaskRunDetails = ({
  onViewChange = defaults.onViewChange,
  pod,
  task = defaults.task,
  taskRun = defaults.taskRun,
  view
}) => {
  const intl = useIntl();
  const displayName = taskRun.metadata.name;
  const taskSpec = task?.spec || taskRun.spec.taskSpec;

  const paramsDescriptions = getDescriptions(taskSpec?.params);
  const resultsDescriptions = getDescriptions(taskSpec?.results);

  const [podContent, setPodContent] = useState();
  const hasEvents = pod?.events?.length > 0;

  const podResource =
    typeof pod?.resource === 'string' ? pod.resource : { ...pod?.resource };
  if (podResource?.metadata?.managedFields) {
    delete podResource.metadata.managedFields;
  }
  let podEvents;
  if (hasEvents) {
    podEvents = pod.events.map(event => {
      const filteredEvent = { ...event };
      delete filteredEvent.metadata?.managedFields;
      return filteredEvent;
    });
  }

  useEffect(() => {
    setPodContent('resource');
  }, [displayName, view]);

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
      key: 'actions',
      header: ''
    }
  ];

  const params = getParams(taskRun.spec);
  const paramsTable = params?.length ? (
    <Table
      size="sm"
      headers={headers}
      rows={params.map(({ name, value }) => ({
        id: name,
        name,
        actions: <HelpIcon title={paramsDescriptions[name]} />,
        value: (
          <span title={value}>
            <Param>{value}</Param>
          </span>
        )
      }))}
    />
  ) : null;

  // taskResults renamed to results in v1
  const results = taskRun.status?.taskResults || taskRun.status?.results;
  const resultsTable = results?.length ? (
    <Table
      size="sm"
      headers={headers}
      rows={results.map(({ name, value }) => ({
        id: name,
        name,
        actions: <HelpIcon title={resultsDescriptions[name]} />,
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
    'status',
    pod && 'pod'
  ].filter(Boolean);

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  const tabList = [];
  const tabPanels = [];
  if (paramsTable) {
    tabList.push(
      <Tab>
        {intl.formatMessage({
          id: 'dashboard.taskRun.params',
          defaultMessage: 'Parameters'
        })}
      </Tab>
    );
    tabPanels.push(
      <TabPanel>
        <div className="tkn--step-status">{paramsTable}</div>
      </TabPanel>
    );
  }
  if (resultsTable) {
    tabList.push(
      <Tab>
        {intl.formatMessage({
          id: 'dashboard.taskRun.results',
          defaultMessage: 'Results'
        })}
      </Tab>
    );
    tabPanels.push(
      <TabPanel>
        <div className="tkn--step-status">{resultsTable}</div>
      </TabPanel>
    );
  }
  tabList.push(
    <Tab>
      {intl.formatMessage({
        id: 'dashboard.taskRun.status',
        defaultMessage: 'Status'
      })}
    </Tab>
  );
  tabPanels.push(
    <TabPanel>
      <div className="tkn--step-status">
        <ViewYAML
          dark
          enableSyntaxHighlighting
          resource={
            taskRun.status ||
            intl.formatMessage({
              id: 'dashboard.taskRun.status.pending',
              defaultMessage: 'Pending'
            })
          }
        />
      </div>
    </TabPanel>
  );
  if (pod) {
    tabList.push(<Tab>Pod</Tab>);
    tabPanels.push(
      <TabPanel>
        <div className="tkn--step-status">
          {hasEvents ? (
            <ContentSwitcher onChange={({ name }) => setPodContent(name)}>
              <Switch
                name="resource"
                text={intl.formatMessage({
                  id: 'dashboard.pod.resource',
                  defaultMessage: 'Resource'
                })}
              />
              <Switch
                name="events"
                text={intl.formatMessage({
                  id: 'dashboard.pod.events',
                  defaultMessage: 'Events'
                })}
              />
            </ContentSwitcher>
          ) : null}
          {podContent === 'resource' ? (
            <ViewYAML dark enableSyntaxHighlighting resource={podResource} />
          ) : null}
          {hasEvents && podContent === 'events' ? (
            <ViewYAML dark enableSyntaxHighlighting resource={podEvents} />
          ) : null}
        </div>
      </TabPanel>
    );
  }

  return (
    <div className="tkn--step-details">
      <DetailsHeader
        displayName={displayName}
        hasWarning={taskRunHasWarning(taskRun)}
        taskRun={taskRun}
        type="taskRun"
      />
      <Tabs
        aria-label="TaskRun details"
        onChange={event => onViewChange(tabs[event.selectedIndex])}
        selectedIndex={selectedTabIndex}
      >
        <TabList>{tabList}</TabList>
        <TabPanels>{tabPanels}</TabPanels>
      </Tabs>
    </div>
  );
};

TaskRunDetails.propTypes = {
  onViewChange: PropTypes.func,
  task: PropTypes.shape({}),
  taskRun: PropTypes.shape({})
};

export default TaskRunDetails;
