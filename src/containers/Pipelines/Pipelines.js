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
import {
  TrashCan16 as DeleteIcon,
  Playlist16 as RunsIcon
} from '@carbon/icons-react';
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

import { ListPageLayout } from '..';
import { fetchPipelines } from '../../actions/pipelines';
import { deletePipeline } from '../../api';
import {
  getPipelines,
  getPipelinesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelines,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';

import '../../scss/Definitions.scss';

export /* istanbul ignore next */ class Pipelines extends Component {
  state = {
    deleteError: null,
    showDeleteModal: false,
    toBeDeleted: []
  };

  componentDidMount() {
    document.title = getTitle({ page: 'Pipelines' });
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

  deletePipeline = pipeline => {
    const { name, namespace } = pipeline.metadata;
    deletePipeline({ name, namespace }).catch(error => {
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
      this.deletePipeline(resource)
    );
    this.closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  };

  openDeleteModal = (selectedRows, cancelSelection) => {
    const resourcesById = keyBy(this.props.pipelines, 'metadata.uid');
    const toBeDeleted = selectedRows.map(({ id }) => resourcesById[id]);
    this.setState({ showDeleteModal: true, toBeDeleted, cancelSelection });
  };

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchPipelines({ filters, namespace });
  }

  render() {
    const {
      error,
      loading,
      pipelines,
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

    const pipelinesFormatted = pipelines.map(pipeline => ({
      id: pipeline.metadata.uid,
      name: (
        <Link
          to={urls.rawCRD.byNamespace({
            namespace: pipeline.metadata.namespace,
            type: 'pipelines',
            name: pipeline.metadata.name
          })}
          title={pipeline.metadata.name}
        >
          {pipeline.metadata.name}
        </Link>
      ),
      namespace: pipeline.metadata.namespace,
      createdTime: (
        <FormattedDate date={pipeline.metadata.creationTimestamp} relative />
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
                this.openDeleteModal([{ id: pipeline.metadata.uid }], () => {})
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
              { kind: 'PipelineRuns', resource: pipeline.metadata.name }
            )}
            kind="ghost"
            renderIcon={RunsIcon}
            size="sm"
            to={urls.pipelineRuns.byPipeline({
              namespace: pipeline.metadata.namespace,
              pipelineName: pipeline.metadata.name
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
            id: 'dashboard.pipelines.errorLoading',
            defaultMessage: 'Error loading Pipelines'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <ListPageLayout title="Pipelines" {...this.props}>
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
          rows={pipelinesFormatted}
          loading={loading && !pipelinesFormatted.length}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No matching {kind} found'
            },
            { kind: 'Pipelines' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage:
                'No matching {kind} found in namespace {selectedNamespace}'
            },
            { kind: 'Pipelines', selectedNamespace }
          )}
        />
        {showDeleteModal ? (
          <DeleteModal
            kind="Pipelines"
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

Pipelines.defaultProps = {
  filters: [],
  pipelines: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getPipelinesErrorMessage(state),
    filters,
    isReadOnly: isReadOnly(state),
    loading: isFetchingPipelines(state),
    namespace,
    pipelines: getPipelines(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelines
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Pipelines));
