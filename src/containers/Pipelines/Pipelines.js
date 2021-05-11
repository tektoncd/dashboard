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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  TrashCan16 as DeleteIcon,
  Playlist16 as RunsIcon
} from '@carbon/icons-react';
import { injectIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import { Button } from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getFilters,
  getTitle,
  urls,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import {
  DeleteModal,
  FormattedDate,
  Table
} from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchPipelines as fetchPipelinesActionCreator } from '../../actions/pipelines';
import { deletePipeline } from '../../api';
import {
  getPipelines,
  getPipelinesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelines,
  isWebSocketConnected,
  isReadOnly as selectIsReadOnly
} from '../../reducers';

export /* istanbul ignore next */ function Pipelines(props) {
  const {
    error,
    fetchPipelines,
    filters,
    intl,
    isReadOnly,
    loading,
    namespace,
    pipelines,
    webSocketConnected
  } = props;

  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  useEffect(() => {
    document.title = getTitle({ page: 'Pipelines' });
  }, []);

  function fetchData() {
    fetchPipelines({ filters, namespace });
  }

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters), namespace]);

  useWebSocketReconnected(fetchData, webSocketConnected);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.pipelines.errorLoading',
          defaultMessage: 'Error loading Pipelines'
        })
      };
    }

    if (deleteError) {
      return {
        clear: () => setDeleteError(null),
        error: deleteError
      };
    }

    return null;
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function handleDeletePipeline(pipeline) {
    const { name, namespace: resourceNamespace } = pipeline.metadata;
    deletePipeline({ name, namespace: resourceNamespace }).catch(err => {
      err.response.text().then(text => {
        const statusCode = err.response.status;
        let errorMessage = `error code ${statusCode}`;
        if (text) {
          errorMessage = `${text} (error code ${statusCode})`;
        }
        setDeleteError(errorMessage);
      });
    });
  }

  async function handleDelete() {
    const deletions = toBeDeleted.map(resource =>
      handleDeletePipeline(resource)
    );
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  function openDeleteModal(selectedRows, handleCancel) {
    const resourcesById = keyBy(pipelines, 'metadata.uid');
    const resourcesToBeDeleted = selectedRows.map(
      ({ id }) => resourcesById[id]
    );
    setShowDeleteModal(true);
    setToBeDeleted(resourcesToBeDeleted);
    setCancelSelection(() => handleCancel);
  }

  const batchActionButtons = isReadOnly
    ? []
    : [
        {
          onClick: openDeleteModal,
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
        {!isReadOnly ? (
          <Button
            className="tkn--danger"
            hasIconOnly
            iconDescription={intl.formatMessage({
              id: 'dashboard.actions.deleteButton',
              defaultMessage: 'Delete'
            })}
            kind="ghost"
            onClick={() =>
              openDeleteModal([{ id: pipeline.metadata.uid }], () => {})
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

  return (
    <ListPageLayout {...props} error={getError()} title="Pipelines">
      <Table
        batchActionButtons={batchActionButtons}
        className="tkn--table--inline-actions"
        headers={initialHeaders}
        rows={pipelinesFormatted}
        loading={loading && !pipelinesFormatted.length}
        selectedNamespace={namespace}
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
          { kind: 'Pipelines', selectedNamespace: namespace }
        )}
      />
      {showDeleteModal ? (
        <DeleteModal
          kind="Pipelines"
          onClose={closeDeleteModal}
          onSubmit={handleDelete}
          resources={toBeDeleted}
          showNamespace={namespace === ALL_NAMESPACES}
        />
      ) : null}
    </ListPageLayout>
  );
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
    isReadOnly: selectIsReadOnly(state),
    loading: isFetchingPipelines(state),
    namespace,
    pipelines: getPipelines(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelines: fetchPipelinesActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Pipelines));
