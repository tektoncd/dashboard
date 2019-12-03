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
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import {
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';
import {
  getErrorMessage,
  getStatus,
  isRunning
} from '@tektoncd/dashboard-utils';
import {
  LabelFilter,
  TaskRuns as TaskRunsList
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
      namespace: selectedNamespace
    } = this.props;

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

    const taskRunActions = this.taskRunActions();
    sortRunsByStartTime(taskRuns);

    return (
      <>
        <LabelFilter
          filters={filters}
          handleAddFilter={this.handleAddFilter}
          handleDeleteFilter={this.handleDeleteFilter}
        />

        <TaskRunsList
          selectedNamespace={selectedNamespace}
          taskRuns={taskRuns}
          taskRunActions={taskRunActions}
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
