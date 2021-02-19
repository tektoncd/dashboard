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
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import keyBy from 'lodash.keyby';
import { InlineNotification } from 'carbon-components-react';
import {
  DeleteModal,
  PipelineRuns as PipelineRunsList,
  StatusFilterDropdown
} from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  generateId,
  getErrorMessage,
  getFilters,
  getStatus,
  getStatusFilter,
  getStatusFilterHandler,
  getTitle,
  isRunning,
  labels,
  runMatchesStatusFilter,
  urls
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import { sortRunsByStartTime } from '../../utils';
import { fetchPipelineRuns } from '../../actions/pipelineRuns';

import {
  getPipelineRuns,
  getPipelineRunsErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineRuns,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun
} from '../../api';

const initialState = {
  deleteError: null,
  showDeleteModal: false,
  toBeDeleted: []
};

export /* istanbul ignore next */ class PipelineRuns extends Component {
  state = initialState;

  componentDidMount() {
    document.title = getTitle({ page: 'PipelineRuns' });
    this.fetchPipelineRuns();
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
      this.fetchPipelineRuns();
    } else if (webSocketConnected && prevWebSocketConnected === false) {
      this.fetchPipelineRuns();
    }
  }

  cancel = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    cancelPipelineRun({ name, namespace }).catch(error => {
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

  closeDeleteModal = () => {
    this.setState({
      showDeleteModal: false,
      toBeDeleted: []
    });
  };

  deleteRun = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    deletePipelineRun({ name, namespace }).catch(error => {
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
    const deletions = toBeDeleted.map(resource => this.deleteRun(resource));
    this.closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  };

  openDeleteModal = (selectedRows, cancelSelection) => {
    const pipelineRunsById = keyBy(this.props.pipelineRuns, 'metadata.uid');
    const toBeDeleted = selectedRows.map(({ id }) => pipelineRunsById[id]);
    this.setState({ showDeleteModal: true, toBeDeleted, cancelSelection });
  };

  pipelineRunActions = () => {
    const { intl } = this.props;

    if (this.props.isReadOnly) {
      return [];
    }
    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelPipelineRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: this.cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.heading',
            defaultMessage: 'Stop PipelineRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.primaryText',
            defaultMessage: 'Stop PipelineRun'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelPipelineRun.body',
                defaultMessage:
                  'Are you sure you would like to stop PipelineRun {name}?'
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
        action: this.deleteRun,
        danger: true,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        modalProperties: {
          danger: true,
          heading: intl.formatMessage(
            {
              id: 'dashboard.deleteResources.heading',
              defaultMessage: 'Delete {kind}'
            },
            { kind: 'PipelineRuns' }
          ),
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
                id: 'dashboard.deletePipelineRun.body',
                defaultMessage:
                  'Are you sure you would like to delete PipelineRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        action: this.rerun
      }
    ];
  };

  rerun = pipelineRun => {
    rerunPipelineRun(pipelineRun);
  };

  reset() {
    this.setState(initialState);
  }

  fetchPipelineRuns() {
    const { filters, namespace } = this.props;
    this.props.fetchPipelineRuns({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      intl,
      loading,
      pipelineName,
      pipelineRuns,
      namespace: selectedNamespace,
      statusFilter
    } = this.props;
    const { showDeleteModal, toBeDeleted } = this.state;

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineRuns.error',
            defaultMessage: 'Error loading PipelineRuns'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }
    const pipelineRunActions = this.pipelineRunActions();
    sortRunsByStartTime(pipelineRuns);

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: () =>
              this.props.history.push(
                urls.pipelineRuns.create() +
                  (pipelineName ? `?pipelineName=${pipelineName}` : '')
              ),
            text: intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            }),
            icon: Add
          }
        ];

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

    const filters = (
      <StatusFilterDropdown
        id={generateId('status-filter-')}
        initialSelectedStatus={statusFilter}
        onChange={({ selectedItem }) => {
          this.props.setStatusFilter(selectedItem.id);
        }}
      />
    );

    return (
      <ListPageLayout title="PipelineRuns" {...this.props}>
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
        <PipelineRunsList
          batchActionButtons={batchActionButtons}
          filters={filters}
          loading={loading && !pipelineRuns.length}
          pipelineRuns={pipelineRuns.filter(run => {
            return runMatchesStatusFilter({
              run,
              statusFilter
            });
          })}
          pipelineRunActions={pipelineRunActions}
          selectedNamespace={selectedNamespace}
          toolbarButtons={toolbarButtons}
        />
        {showDeleteModal ? (
          <DeleteModal
            kind="PipelineRuns"
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

PipelineRuns.defaultProps = {
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const statusFilter = getStatusFilter(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  const pipelineFilter =
    filters.find(filter => filter.indexOf(`${labels.PIPELINE}=`) !== -1) || '';
  const pipelineName = pipelineFilter.replace(`${labels.PIPELINE}=`, '');

  return {
    isReadOnly: isReadOnly(state),
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    namespace,
    filters,
    pipelineName,
    pipelineRuns: getPipelineRuns(state, {
      filters,
      namespace
    }),
    setStatusFilter: getStatusFilterHandler(props),
    statusFilter,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineRuns));
