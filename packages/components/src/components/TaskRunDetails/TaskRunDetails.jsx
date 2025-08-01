/*
Copyright 2020-2025 The Tekton Authors
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
import {
  dashboardReasonSkipped,
  getParams,
  getTranslateWithId,
  taskRunHasWarning
} from '@tektoncd/dashboard-utils';
import {
  ContentSwitcher,
  Dropdown,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip
} from '@carbon/react';
import { Information } from '@carbon/react/icons';

import DetailsHeader from '../DetailsHeader';
import Param from '../Param';
import Table from '../Table';
import ViewYAML from '../ViewYAML';

const itemToString = item => (item ? item.text : '');

function HelpIcon({ title }) {
  if (!title) {
    return null;
  }

  return (
    <Tooltip align="top-end" autoAlign label={title}>
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
  fullTaskRun,
  getLogsToolbar,
  logs,
  onRetryChange,
  onViewChange = defaults.onViewChange,
  pod,
  selectedRetry,
  skippedTask,
  task = defaults.task,
  taskRun = defaults.taskRun,
  view
}) => {
  const intl = useIntl();
  const displayName = taskRun.metadata?.name;
  const taskSpec = task?.spec || taskRun.spec?.taskSpec;

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

    /* istanbul ignore if */
    if (!view && logs) {
      onViewChange('logs');
    }
  }, [displayName, view]);

  if (!taskRun.metadata) {
    return null;
  }

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
    logs && 'logs',
    paramsTable && 'params',
    resultsTable && 'results',
    'status',
    !skippedTask && pod && 'pod'
  ].filter(Boolean);

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  const tabList = [];
  const tabPanels = [];
  /* istanbul ignore if */
  if (logs) {
    tabList.push(
      <Tab data-tab="logs" key="logs">
        {intl.formatMessage({
          id: 'dashboard.taskRun.logs',
          defaultMessage: 'Logs'
        })}
      </Tab>
    );
    tabPanels.push(
      <TabPanel key="logs">
        {selectedTabIndex === tabPanels.length && (
          <div className="tkn--step-status">{logs}</div>
        )}
      </TabPanel>
    );
  }
  if (paramsTable) {
    tabList.push(
      <Tab data-tab="params" key="params">
        {intl.formatMessage({
          id: 'dashboard.taskRun.params',
          defaultMessage: 'Parameters'
        })}
      </Tab>
    );
    tabPanels.push(
      <TabPanel key="params">
        {selectedTabIndex === tabPanels.length && (
          <div className="tkn--step-status">{paramsTable}</div>
        )}
      </TabPanel>
    );
  }
  if (resultsTable) {
    tabList.push(
      <Tab data-tab="results" key="results">
        {intl.formatMessage({
          id: 'dashboard.taskRun.results',
          defaultMessage: 'Results'
        })}
      </Tab>
    );
    tabPanels.push(
      <TabPanel key="results">
        {selectedTabIndex === tabPanels.length && (
          <div className="tkn--step-status">{resultsTable}</div>
        )}
      </TabPanel>
    );
  }
  tabList.push(
    <Tab data-tab="status" key="status">
      {intl.formatMessage({
        id: 'dashboard.taskRun.status',
        defaultMessage: 'Status'
      })}
    </Tab>
  );
  tabPanels.push(
    <TabPanel key="status">
      {selectedTabIndex === tabPanels.length && (
        <div className="tkn--step-status">
          <ViewYAML
            dark
            enableSyntaxHighlighting
            resource={
              skippedTask ||
              taskRun.status ||
              intl.formatMessage({
                id: 'dashboard.taskRun.status.pending',
                defaultMessage: 'Pending'
              })
            }
          />
        </div>
      )}
    </TabPanel>
  );
  if (!skippedTask && pod) {
    tabList.push(
      <Tab data-tab="pod" key="pod">
        Pod
      </Tab>
    );
    tabPanels.push(
      <TabPanel key="pod">
        {selectedTabIndex === tabPanels.length && (
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
        )}
      </TabPanel>
    );
  }

  let retryMenuTitle;
  /* istanbul ignore if */
  if (logs && (selectedRetry || fullTaskRun?.status?.retriesStatus)) {
    retryMenuTitle = intl.formatMessage({
      id: 'dashboard.pipelineRun.retries.view',
      defaultMessage: 'View retries'
    });
  }

  /* istanbul ignore next */
  const retryMenuItems =
    logs &&
    fullTaskRun?.status?.retriesStatus
      ?.map((_retryStatus, index) => {
        return {
          id: index,
          text: intl.formatMessage(
            {
              id: 'dashboard.pipelineRun.retries.viewAttempt',
              defaultMessage: 'Attempt #{retryNumber, number}'
            },
            { retryNumber: index }
          )
        };
      })
      .concat({
        id: '',
        text: intl.formatMessage(
          {
            id: 'dashboard.pipelineRun.retries.viewLatestAttempt',
            defaultMessage: 'Latest attempt #{retryNumber, number}'
          },
          { retryNumber: fullTaskRun.status.retriesStatus.length }
        )
      });

  return (
    <div className="tkn--step-details">
      <DetailsHeader
        displayName={displayName}
        hasWarning={taskRunHasWarning(taskRun)}
        reason={skippedTask ? dashboardReasonSkipped : null}
        taskRun={taskRun}
        type="taskRun"
      >
        {logs && fullTaskRun?.status?.retriesStatus ? (
          <Dropdown
            autoAlign
            className="tkn--taskrun-retries-dropdown"
            hideLabel
            id={`${taskRun.metadata.uid}-retry`}
            initialSelectedItem={
              retryMenuItems[
                selectedRetry || fullTaskRun.status.retriesStatus.length - 1
              ]
            }
            items={retryMenuItems}
            itemToString={itemToString}
            label={retryMenuTitle}
            onChange={({ selectedItem }) => {
              onRetryChange(selectedItem.id);
            }}
            size="sm"
            titleText={retryMenuTitle}
            translateWithId={getTranslateWithId(intl)}
            type="inline"
          />
        ) : null}
        {getLogsToolbar
          ? getLogsToolbar({
              id: 'logs-toolbar',
              taskRun
            })
          : null}
      </DetailsHeader>
      <Tabs
        onChange={event => onViewChange(tabs[event.selectedIndex])}
        selectedIndex={selectedTabIndex}
      >
        <TabList activation="manual" aria-label="TaskRun details">
          {tabList}
        </TabList>
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
