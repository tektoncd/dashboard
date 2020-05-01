/*
Copyright 2019-2020 The Tekton Authors
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
import { TaskRuns as TaskRunsList } from '@tektoncd/dashboard-components';
import {
  getErrorMessage,
  getFilters,
  getStatus,
  getTitle,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';
import { Add16 as Add } from '@carbon/icons-react';

import { CreateTaskRun, LabelFilter } from '..';
import { sortRunsByStartTime } from '../../utils';
import { fetchTaskRuns } from '../../actions/taskRuns';

import {
  getSelectedNamespace,
  getTaskRuns,
  getTaskRunsErrorMessage,
  isFetchingTaskRuns,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';
import { cancelTaskRun, deleteTaskRun } from '../../api';

const initialState = {
  showCreateTaskRunModal: false,
  createdTaskRun: null,
  submitError: ''
};

export /* istanbul ignore next */ class TaskRuns extends Component {
  constructor(props) {
    super(props);

    this.handleCreateTaskRunSuccess = this.handleCreateTaskRunSuccess.bind(
      this
    );

    this.state = initialState;
  }

  componentDidMount() {
    document.title = getTitle({ page: 'TaskRuns' });
    this.fetchTaskRuns();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (namespace !== prevNamespace || !isEqual(filters, prevFilters)) {
      this.reset();
      this.fetchTaskRuns();
    } else if (webSocketConnected && prevWebSocketConnected === false) {
      this.fetchTaskRuns();
    }
  }

  cancel = taskRun => {
    const { name, namespace } = taskRun.metadata;
    cancelTaskRun({ name, namespace });
  };

  deleteTask = taskRun => {
    const { name, namespace } = taskRun.metadata;
    deleteTaskRun({ name, namespace }).catch(error => {
      error.response.text().then(text => {
        const statusCode = error.response.status;
        let errorMessage = `error code ${statusCode}`;
        if (text) {
          errorMessage = `${text} (error code ${statusCode})`;
        }
        this.setState({ submitError: errorMessage });
      });
    });
  };

  resetSuccess = () => {
    this.setState({ createdTaskRun: false });
  };

  toggleModal = showCreateTaskRunModal => {
    this.setState({ showCreateTaskRunModal });
  };

  taskRunActions = () => {
    const { intl } = this.props;

    if (this.props.isReadOnly) {
      return [];
    }
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
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: this.deleteTask,
        danger: true,
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
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
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

  handleCreateTaskRunSuccess(newTaskRun) {
    const {
      metadata: { namespace, name }
    } = newTaskRun;
    const url = urls.taskRuns.byName({
      namespace,
      taskRunName: name
    });
    this.toggleModal(false);
    this.setState({ createdTaskRun: { name, url } });
  }

  reset() {
    this.setState(initialState);
  }

  fetchTaskRuns() {
    const { namespace, taskName, filters, kind } = this.props;

    if (kind === 'ClusterTask') {
      // TaskRuns from ClusterTask should have label 'tekton.dev/clusterTask=',
      // (and that is the filter on the page), but some taskruns might still
      // only have the old label 'tekton.dev/task='
      // So, for ClusterTasks, also fetch with the old filter:
      this.props.fetchTaskRuns({ filters: [`tekton.dev/task=${taskName}`] });
    }

    this.props.fetchTaskRuns({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      loading,
      namespace: selectedNamespace,
      taskRuns,
      intl
    } = this.props;

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.taskRuns.errorLoading',
            defaultMessage: 'Error loading TaskRuns'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }
    const taskRunActions = this.taskRunActions();
    sortRunsByStartTime(taskRuns);

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: () => this.toggleModal(true),
            text: intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            }),
            icon: Add
          }
        ];

    return (
      <>
        {this.state.createdTaskRun && (
          <InlineNotification
            kind="success"
            title={intl.formatMessage({
              id: 'dashboard.taskRuns.createSuccess',
              defaultMessage: 'Successfully created TaskRun'
            })}
            subtitle={
              <Link to={this.state.createdTaskRun.url}>
                {this.state.createdTaskRun.name}
              </Link>
            }
            onCloseButtonClick={this.resetSuccess}
            lowContrast
          />
        )}
        {this.state.submitError && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(this.state.submitError)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        <h1>TaskRuns</h1>
        <LabelFilter {...this.props} />
        {!this.props.isReadOnly && (
          <CreateTaskRun
            open={this.state.showCreateTaskRunModal}
            onClose={() => this.toggleModal(false)}
            onSuccess={this.handleCreateTaskRunSuccess}
            taskRef={this.props.taskName}
            namespace={selectedNamespace}
            kind={this.props.kind}
          />
        )}
        <TaskRunsList
          loading={loading && !taskRuns.length}
          selectedNamespace={selectedNamespace}
          taskRuns={taskRuns}
          taskRunActions={taskRunActions}
          toolbarButtons={toolbarButtons}
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
    filters.find(f => f.indexOf('tekton.dev/task=') !== -1) || '';
  const clusterTaskFilter =
    filters.find(f => f.indexOf('tekton.dev/clusterTask=') !== -1) || '';
  const kind = clusterTaskFilter ? 'ClusterTask' : 'Task';

  const taskName =
    kind === 'ClusterTask'
      ? clusterTaskFilter.replace('tekton.dev/clusterTask=', '')
      : taskFilter.replace('tekton.dev/task=', '');

  let taskRuns = getTaskRuns(state, { filters, namespace });
  if (kind === 'ClusterTask') {
    // TaskRuns from ClusterTask should have label 'tekton.dev/clusterTask=',
    // (and that is the filter on the page), but some taskruns might still
    // only have the old label 'tekton.dev/task='
    // So, for ClusterTasks, also fetch with the old filter:
    const clusterTaskRuns = getTaskRuns(state, {
      filters: [`tekton.dev/task=${taskName}`]
    });

    // Then merge the arrays, using a Set to prevent duplicates
    taskRuns = [...new Set([...taskRuns, ...clusterTaskRuns])];
  }

  return {
    isReadOnly: isReadOnly(state),
    error: getTaskRunsErrorMessage(state),
    loading: isFetchingTaskRuns(state),
    namespace,
    filters,
    taskName,
    kind,
    taskRuns,
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
