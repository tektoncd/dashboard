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
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import keyBy from 'lodash.keyby';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import {
  Modal,
  PipelineResources as PipelineResourcesList
} from '@tektoncd/dashboard-components';
import {
  InlineNotification,
  ListItem,
  UnorderedList
} from 'carbon-components-react';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import { fetchPipelineResources } from '../../actions/pipelineResources';
import { deletePipelineResource } from '../../api';
import {
  getPipelineResources,
  getPipelineResourcesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineResources,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';

const initialState = {
  deleteError: '',
  isDeleteModalOpen: false,
  toBeDeleted: []
};

export /* istanbul ignore next */ class PipelineResources extends Component {
  state = initialState;

  componentDidMount() {
    document.title = getTitle({ page: 'PipelineResources' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  openDeleteModal = (selectedRows, cancelSelection) => {
    const pipelineResourcesById = keyBy(
      this.props.pipelineResources,
      'metadata.uid'
    );
    const toBeDeleted = selectedRows.map(({ id }) => pipelineResourcesById[id]);

    this.setState({ isDeleteModalOpen: true, toBeDeleted, cancelSelection });
  };

  closeDeleteModal = () => {
    this.setState({
      isDeleteModalOpen: false,
      toBeDeleted: []
    });
  };

  handleDelete = async () => {
    const { cancelSelection, toBeDeleted } = this.state;
    const deletions = toBeDeleted.map(resource =>
      this.deleteResource(resource)
    );
    this.closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  };

  deleteResource = pipelineResource => {
    const { name, namespace } = pipelineResource.metadata;
    return deletePipelineResource({ name, namespace }).catch(error => {
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

  pipelineResourceActions = () => {
    const { intl } = this.props;
    if (this.props.isReadOnly) {
      return [];
    }

    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: this.deleteResource,
        modalProperties: {
          danger: true,
          heading: intl.formatMessage({
            id: 'dashboard.deletePipelineResource.heading',
            defaultMessage: 'Delete PipelineResource'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.deletePipelineResource.primaryText',
            defaultMessage: 'Delete PipelineResource'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deletePipelineResource.body',
                defaultMessage:
                  'Are you sure you would like to delete PipelineResource {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  };

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchPipelineResources({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      loading,
      namespace: selectedNamespace,
      pipelineResources,
      intl
    } = this.props;

    const { isDeleteModalOpen, toBeDeleted } = this.state;

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineResources.error',
            defaultMessage: 'Error loading PipelineResources'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: () =>
              this.props.history.push(urls.pipelineResources.create()),
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

    return (
      <ListPageLayout title="PipelineResources" {...this.props}>
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
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        <PipelineResourcesList
          batchActionButtons={batchActionButtons}
          loading={loading && !pipelineResources.length}
          pipelineResources={pipelineResources}
          selectedNamespace={selectedNamespace}
          toolbarButtons={toolbarButtons}
        />
        {isDeleteModalOpen ? (
          <Modal
            open={isDeleteModalOpen}
            primaryButtonText={intl.formatMessage({
              id: 'dashboard.actions.deleteButton',
              defaultMessage: 'Delete'
            })}
            secondaryButtonText={intl.formatMessage({
              id: 'dashboard.modal.cancelButton',
              defaultMessage: 'Cancel'
            })}
            modalHeading={intl.formatMessage({
              id: 'dashboard.pipelineResources.deleteHeading',
              defaultMessage: 'Delete PipelineResources'
            })}
            onSecondarySubmit={this.closeDeleteModal}
            onRequestSubmit={this.handleDelete}
            onRequestClose={this.closeDeleteModal}
            danger
          >
            <p>
              {intl.formatMessage({
                id: 'dashboard.pipelineResources.deleteConfirm',
                defaultMessage:
                  'Are you sure you want to delete these PipelineResources?'
              })}
            </p>
            <UnorderedList nested>
              {toBeDeleted.map(pipelineResource => {
                const { name, namespace } = pipelineResource.metadata;
                return <ListItem key={`${name}:${namespace}`}>{name}</ListItem>;
              })}
            </UnorderedList>
          </Modal>
        ) : null}
      </ListPageLayout>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getPipelineResourcesErrorMessage(state),
    isReadOnly: isReadOnly(state),
    filters,
    loading: isFetchingPipelineResources(state),
    namespace,
    pipelineResources: getPipelineResources(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineResources
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineResources));
