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
import { InlineNotification } from 'carbon-components-react';
import {
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
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
          danger: true,
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

    const taskRunActions = this.taskRunActions();

    sortRunsByStartTime(taskRuns);

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
          handleAddFilter={getAddFilterHandler(this.props)}
          handleDeleteFilter={getDeleteFilterHandler(this.props)}
        />
        <TaskRunsList
          loading={loading}
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
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
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
