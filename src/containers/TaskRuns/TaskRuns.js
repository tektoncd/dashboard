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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import isEqual from 'lodash.isequal';
import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';
import {
  getErrorMessage,
  getStatus,
  getStatusIcon,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';
import {
  CancelButton,
  FormattedDate,
  LabelFilter
} from '@tektoncd/dashboard-components';

import { sortRunsByStartTime } from '../../utils';
import { fetchTaskRuns } from '../../actions/taskRuns';

import {
  getSelectedNamespace,
  getTaskRuns,
  getTaskRunsErrorMessage,
  isFetchingTaskRuns,
  isWebSocketConnected
} from '../../reducers';
import { cancelTaskRun } from '../../api';

export /* istanbul ignore next */ class TaskRuns extends Component {
  componentDidMount() {
    this.fetchTaskRuns();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      !isEqual(filters, prevFilters) ||
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchTaskRuns();
    }
  }

  handleAddFilter = labelFilters => {
    const queryParams = `?${new URLSearchParams({
      labelSelector: labelFilters
    }).toString()}`;

    const currentURL = this.props.match.url;
    const browserURL = currentURL.concat(queryParams);
    this.props.history.push(browserURL);
  };

  handleDeleteFilter = filter => {
    const currentQueryParams = new URLSearchParams(this.props.location.search);
    const labelFilters = currentQueryParams.getAll('labelSelector');
    const labelFiltersArray = labelFilters.toString().split(',');
    const index = labelFiltersArray.indexOf(filter);
    labelFiltersArray.splice(index, 1);

    const currentURL = this.props.match.url;
    if (labelFiltersArray.length === 0) {
      this.props.history.push(currentURL);
    } else {
      const newQueryParams = `?${new URLSearchParams({
        labelSelector: labelFiltersArray
      }).toString()}`;
      const browserURL = currentURL.concat(newQueryParams);
      this.props.history.push(browserURL);
    }
  };

  fetchTaskRuns() {
    const { filters, namespace } = this.props;
    this.props.fetchTaskRuns({
      filters,
      namespace
    });
  }

  render() {
    const { error, filters, loading, taskRuns } = this.props;

    if ((!taskRuns || !taskRuns.length) && loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading TaskRuns"
          subtitle={getErrorMessage(error)}
        />
      );
    }

    sortRunsByStartTime(taskRuns);

    return (
      <>
        <LabelFilter
          filters={filters}
          handleAddFilter={this.handleAddFilter}
          handleDeleteFilter={this.handleDeleteFilter}
        />

        <StructuredListWrapper border selection>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>TaskRun</StructuredListCell>
              <StructuredListCell head>Task</StructuredListCell>
              <StructuredListCell head>Namespace</StructuredListCell>
              <StructuredListCell head>Status</StructuredListCell>
              <StructuredListCell head>Last Transition Time</StructuredListCell>
              <StructuredListCell head />
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {!taskRuns.length && (
              <StructuredListRow>
                <StructuredListCell>
                  <span>No TaskRuns</span>
                </StructuredListCell>
              </StructuredListRow>
            )}
            {taskRuns.map(taskRun => {
              const { name, namespace } = taskRun.metadata;
              let taskRefName = '';
              if (taskRun.spec.taskRef) {
                taskRefName = taskRun.spec.taskRef.name;
              }
              const { lastTransitionTime, reason, status } = getStatus(taskRun);
              let message;
              if (!taskRun.status.conditions) {
                message = '';
              } else if (
                !taskRun.status.conditions[0].message &&
                taskRun.status.conditions[0].status
              ) {
                message = 'All Steps have completed executing';
              } else {
                message = taskRun.status.conditions[0].message; // eslint-disable-line
              }

              return (
                <StructuredListRow
                  className="definition"
                  key={taskRun.metadata.uid}
                >
                  <StructuredListCell>
                    <Link
                      to={urls.taskRuns.byName({
                        namespace,
                        taskRunName: name
                      })}
                    >
                      {name}
                    </Link>
                  </StructuredListCell>
                  <StructuredListCell>
                    {taskRefName && (
                      <Link
                        to={urls.taskRuns.byTask({
                          namespace,
                          taskName: taskRefName
                        })}
                      >
                        {taskRefName}
                      </Link>
                    )}
                  </StructuredListCell>
                  <StructuredListCell>{namespace}</StructuredListCell>
                  <StructuredListCell
                    className="status"
                    data-reason={reason}
                    data-status={status}
                  >
                    {getStatusIcon({ reason, status })}
                    {message}
                  </StructuredListCell>
                  <StructuredListCell>
                    <FormattedDate date={lastTransitionTime} relative />
                  </StructuredListCell>
                  <StructuredListCell>
                    {isRunning(reason, status) && (
                      <CancelButton
                        type="TaskRun"
                        name={name}
                        onCancel={() =>
                          cancelTaskRun({
                            name,
                            namespace
                          })
                        }
                      />
                    )}
                  </StructuredListCell>
                </StructuredListRow>
              );
            })}
          </StructuredListBody>
        </StructuredListWrapper>
      </>
    );
  }
}

TaskRuns.defaultProps = {
  filters: []
};

/* istanbul ignore next */
export function fetchFilters(searchQuery) {
  const queryParams = new URLSearchParams(searchQuery);
  let filters = [];
  queryParams.forEach(function filterValueSplit(value) {
    filters = value.split(',');
  });
  return filters;
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = fetchFilters(props.location.search);
  const namespace = namespaceParam || getSelectedNamespace(state);

  const taskFilter =
    filters.find(filter => filter.indexOf('tekton.dev/task=') !== -1) || '';
  const taskName = taskFilter.replace('tekton.dev/task=', '');

  return {
    error: getTaskRunsErrorMessage(state),
    filters,
    loading: isFetchingTaskRuns(state),
    namespace,
    taskName,
    taskRuns: getTaskRuns(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskRuns);
