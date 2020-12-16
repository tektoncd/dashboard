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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import keyBy from 'lodash.keyby';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import {
  Button,
  InlineNotification,
  ListItem,
  Modal,
  UnorderedList
} from 'carbon-components-react';
import { TrashCan32 as Delete, Information16 } from '@carbon/icons-react';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';

import { ListPageLayout } from '..';
import { fetchClusterTasks } from '../../actions/tasks';
import { deleteClusterTask } from '../../api';
import {
  getClusterTasks,
  getClusterTasksErrorMessage,
  isFetchingClusterTasks,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class ClusterTasksContainer extends Component {
  state = {
    deleteError: null,
    showDeleteModal: false,
    toBeDeleted: []
  };

  componentDidMount() {
    document.title = getTitle({ page: 'ClusterTasks' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    if (
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

  deleteClusterTask = clusterTask => {
    const { name, namespace } = clusterTask.metadata;
    deleteClusterTask({ name, namespace }).catch(error => {
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
    const deletions = toBeDeleted.map(resource =>
      this.deleteClusterTask(resource)
    );
    this.closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  };

  openDeleteModal = (selectedRows, cancelSelection) => {
    const resourcesById = keyBy(this.props.clusterTasks, 'metadata.uid');
    const toBeDeleted = selectedRows.map(({ id }) => resourcesById[id]);
    this.setState({ showDeleteModal: true, toBeDeleted, cancelSelection });
  };

  fetchData() {
    const { filters } = this.props;
    this.props.fetchClusterTasks({ filters });
  }

  render() {
    const { error, loading, clusterTasks, intl } = this.props;
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
            icon: Delete
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

    const clusterTasksFormatted = clusterTasks.map(clusterTask => ({
      id: clusterTask.metadata.uid,
      name: (
        <Link
          to={urls.taskRuns.byClusterTask({
            taskName: clusterTask.metadata.name
          })}
          title={clusterTask.metadata.name}
        >
          {clusterTask.metadata.name}
        </Link>
      ),
      createdTime: (
        <FormattedDate date={clusterTask.metadata.creationTimestamp} relative />
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
                this.openDeleteModal(
                  [{ id: clusterTask.metadata.uid }],
                  () => {}
                )
              }
              renderIcon={Delete}
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
                id: 'dashboard.resourceList.viewDetails',
                defaultMessage: 'View {resource}'
              },
              { resource: clusterTask.metadata.name }
            )}
            kind="ghost"
            renderIcon={Information16}
            size="sm"
            to={urls.rawCRD.cluster({
              type: 'clustertasks',
              name: clusterTask.metadata.name
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
          hideCloseButton
          kind="error"
          title={intl.formatMessage({
            id: 'dashboard.clusterTasks.errorLoading',
            defaultMessage: 'Error loading ClusterTasks'
          })}
          subtitle={getErrorMessage(error)}
          lowContrast
        />
      );
    }
    return (
      <ListPageLayout
        hideNamespacesDropdown
        title="ClusterTasks"
        {...this.props}
      >
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
          rows={clusterTasksFormatted}
          loading={loading && !clusterTasksFormatted.length}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'ClusterTasks' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.clusterResource',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'ClusterTasks' }
          )}
        />
        {showDeleteModal ? (
          <Modal
            open={showDeleteModal}
            primaryButtonText={intl.formatMessage({
              id: 'dashboard.actions.deleteButton',
              defaultMessage: 'Delete'
            })}
            secondaryButtonText={intl.formatMessage({
              id: 'dashboard.modal.cancelButton',
              defaultMessage: 'Cancel'
            })}
            modalHeading={intl.formatMessage(
              {
                id: 'dashboard.deleteResources.heading',
                defaultMessage: 'Delete {kind}'
              },
              { kind: 'ClusterTasks' }
            )}
            onSecondarySubmit={this.closeDeleteModal}
            onRequestSubmit={this.handleDelete}
            onRequestClose={this.closeDeleteModal}
            danger
          >
            <p>
              {intl.formatMessage(
                {
                  id: 'dashboard.deleteResources.confirm',
                  defaultMessage:
                    'Are you sure you want to delete these {kind}?'
                },
                { kind: 'ClusterTasks' }
              )}
            </p>
            <UnorderedList nested>
              {toBeDeleted.map(clusterTask => {
                const { name } = clusterTask.metadata;
                return <ListItem key={name}>{name}</ListItem>;
              })}
            </UnorderedList>
          </Modal>
        ) : null}
      </ListPageLayout>
    );
  }
}

ClusterTasksContainer.defaultProps = {
  clusterTasks: [],
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);
  return {
    clusterTasks: getClusterTasks(state, { filters }),
    error: getClusterTasksErrorMessage(state),
    filters,
    isReadOnly: isReadOnly(state),
    loading: isFetchingClusterTasks(state),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTasks
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ClusterTasksContainer));
