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
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { InlineNotification } from 'carbon-components-react';
import {
  getErrorMessage,
  getStatus,
  getStatusIcon,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';
import {
  FormattedDate,
  LabelFilter,
  RunDropdown,
  Table
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
import { cancelTaskRun, deleteTaskRun } from '../../api';

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

  cancel = taskRun => {
    const { name, namespace } = taskRun.metadata;
    cancelTaskRun({ name, namespace });
  };

  deleteTask = taskRun => {
    const { name, namespace } = taskRun.metadata;
    deleteTaskRun({ name, namespace });
  };

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

  taskRunActions = () => {
    const { intl } = this.props;
    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelTaskRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: this.cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.heading',
            defaultMessage: 'Stop TaskRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.primaryText',
            defaultMessage: 'Stop TaskRun'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to stop TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.deleteTaskRun.actionText',
          defaultMessage: 'Delete'
        }),
        action: this.deleteTask,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.deleteTaskRun.heading',
            defaultMessage: 'Delete TaskRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.deleteTaskRun.primaryText',
            defaultMessage: 'Delete TaskRun'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to delete TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  };

  fetchTaskRuns() {
    const { filters, namespace } = this.props;
    this.props.fetchTaskRuns({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      filters,
      loading,
      taskRuns,
      intl,
      namespace: selectedNamespace
    } = this.props;

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'task',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.task',
          defaultMessage: 'Task'
        })
      },
      {
        key: 'namespace',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      },
      {
        key: 'status',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.status',
          defaultMessage: 'Status'
        })
      },
      {
        key: 'transitionTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.transitionTime',
          defaultMessage: 'Last Transition Time'
        })
      },
      {
        key: 'dropdown'
      }
    ];
    const taskRunActions = this.taskRunActions();

    sortRunsByStartTime(taskRuns);

    const taskRunsFormatted = taskRuns.map(taskRun => ({
      id: `${taskRun.metadata.namespace}:${taskRun.metadata.name}`,
      name: (
        <Link
          to={urls.taskRuns.byName({
            namespace: taskRun.metadata.namespace,
            taskRunName: taskRun.metadata.name
          })}
        >
          {taskRun.metadata.name}
        </Link>
      ),
      task: (
        <Link
          to={urls.taskRuns.byTask({
            namespace: taskRun.metadata.namespace,
            taskName: taskRun.spec.taskRef.name
          })}
        >
          {taskRun.spec.taskRef.name}
        </Link>
      ),
      namespace: taskRun.metadata.namespace,
      status: (
        <div className="definition">
          <div
            className="status"
            data-status={getStatus(taskRun).status}
            data-reason={getStatus(taskRun).reason}
          >
            <div className="status-icon">
              {getStatusIcon(getStatus(taskRun))}
            </div>
            {getStatus(taskRun).message}
          </div>
        </div>
      ),
      transitionTime: (
        <FormattedDate date={getStatus(taskRun).lastTransitionTime} relative />
      ),
      type: taskRun.spec.type,
      dropdown: <RunDropdown items={taskRunActions} resource={taskRun} />
    }));

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

    return (
      <>
        <h1>TaskRuns</h1>
        <LabelFilter
          filters={filters}
          handleAddFilter={this.handleAddFilter}
          handleDeleteFilter={this.handleDeleteFilter}
        />
        <Table
          headers={initialHeaders}
          rows={taskRunsFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'TaskRuns' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'TaskRuns', selectedNamespace }
          )}
        />
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
)(injectIntl(TaskRuns));
