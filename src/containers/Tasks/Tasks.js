/*
Copyright 2019-2021 The Tekton Authors
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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import keyBy from 'lodash.keyby';
import { Button, InlineNotification } from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import {
  DeleteModal,
  FormattedDate,
  Table
} from '@tektoncd/dashboard-components';
import {
  TrashCan16 as DeleteIcon,
  Playlist16 as RunsIcon
} from '@carbon/icons-react';

import { ListPageLayout } from '..';
import { fetchTasks } from '../../actions/tasks';
import { deleteTask } from '../../api';
import {
  getSelectedNamespace,
  getTasks,
  getTasksErrorMessage,
  isFetchingTasks,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';

import '../../scss/Definitions.scss';

export /* istanbul ignore next */ class Tasks extends Component {
  state = {
    deleteError: null,
    showDeleteModal: false,
    toBeDeleted: []
  };

  componentDidMount() {
    document.title = getTitle({ page: 'Tasks' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    if (
      namespace !== prevProps.namespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  closeDeleteModal = () => {
    this.setState({
      showDeleteModal: false,
      toBeDeleted: []
    });
  };

  deleteTask = task => {
    const { name, namespace } = task.metadata;
    deleteTask({ name, namespace }).catch(error => {
      error.response.text().then(text => {
        const statusCode = error.response.status;
        let errorMessage = `error code ${statusCode}`;
        if (text) {
          errorMessage = `${text} (error code ${statusCode})`;
        }
        this.setState({ deleteError: errorMessage });
      });
    });
  };

  handleDelete = async () => {
    const { cancelSelection, toBeDeleted } = this.state;
    const deletions = toBeDeleted.map(resource => this.deleteTask(resource));
    this.closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  };

  openDeleteModal = (selectedRows, cancelSelection) => {
    const resourcesById = keyBy(this.props.tasks, 'metadata.uid');
    const toBeDeleted = selectedRows.map(({ id }) => resourcesById[id]);
    this.setState({ showDeleteModal: true, toBeDeleted, cancelSelection });
  };

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchTasks({ filters, namespace });
  }

  render() {
    const {
      error,
      loading,
      tasks,
      intl,
      namespace: selectedNamespace
    } = this.props;
    const { showDeleteModal, toBeDeleted } = this.state;

    const batchActionButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: this.openDeleteModal,
            text: intl.formatMessage({
              id: 'dashboard.actions.deleteButton',
              defaultMessage: 'Delete'
            }),
            icon: DeleteIcon
          }
        ];

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: 'Namespace'
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'actions',
        header: ''
      }
    ];

    const tasksFormatted = tasks.map(task => ({
      id: task.metadata.uid,
      name: (
        <Link
          to={urls.rawCRD.byNamespace({
            namespace: task.metadata.namespace,
            type: 'tasks',
            name: task.metadata.name
          })}
          title={task.metadata.name}
        >
          {task.metadata.name}
        </Link>
      ),
      namespace: task.metadata.namespace,
      createdTime: (
        <FormattedDate date={task.metadata.creationTimestamp} relative />
      ),
      actions: (
        <>
          {!this.props.isReadOnly ? (
            <Button
              className="tkn--danger"
              hasIconOnly
              iconDescription={intl.formatMessage({
                id: 'dashboard.actions.deleteButton',
                defaultMessage: 'Delete'
              })}
              kind="ghost"
              onClick={() =>
                this.openDeleteModal([{ id: task.metadata.uid }], () => {})
              }
              renderIcon={DeleteIcon}
              size="sm"
              tooltipAlignment="center"
              tooltipPosition="left"
            />
          ) : null}
          <Button
            as={Link}
            hasIconOnly
            iconDescription={intl.formatMessage(
              {
                id: 'dashboard.resourceList.viewRuns',
                defaultMessage: 'View {kind} of {resource}'
              },
              { kind: 'TaskRuns', resource: task.metadata.name }
            )}
            kind="ghost"
            renderIcon={RunsIcon}
            size="sm"
            to={urls.taskRuns.byTask({
              namespace: task.metadata.namespace,
              taskName: task.metadata.name
            })}
            tooltipAlignment="center"
            tooltipPosition="left"
          />
        </>
      )
    }));

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.tasks.errorLoading',
            defaultMessage: 'Error loading Tasks'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <ListPageLayout title="Tasks" {...this.props}>
        {this.state.deleteError && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(this.state.deleteError)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            onCloseButtonClick={() => {
              this.setState({ deleteError: null });
            }}
            lowContrast
          />
        )}
        <Table
          batchActionButtons={batchActionButtons}
          className="tkn--table--inline-actions"
          headers={initialHeaders}
          rows={tasksFormatted}
          loading={loading && !tasksFormatted.length}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'Tasks' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage:
                'No matching {kind} found in namespace {selectedNamespace}'
            },
            { kind: 'Tasks', selectedNamespace }
          )}
        />
        {showDeleteModal ? (
          <DeleteModal
            kind="Tasks"
            onClose={this.closeDeleteModal}
            onSubmit={this.handleDelete}
            resources={toBeDeleted}
            showNamespace={selectedNamespace === ALL_NAMESPACES}
          />
        ) : null}
      </ListPageLayout>
    );
  }
}

Tasks.defaultProps = {
  filters: [],
  tasks: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getTasksErrorMessage(state),
    filters,
    isReadOnly: isReadOnly(state),
    loading: isFetchingTasks(state),
    namespace,
    tasks: getTasks(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTasks
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Tasks));
