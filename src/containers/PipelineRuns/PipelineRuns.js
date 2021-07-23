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
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  DeleteModal,
  PipelineRuns as PipelineRunsList,
  StatusFilterDropdown
} from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  generateId,
  getFilters,
  getStatus,
  getStatusFilter,
  getStatusFilterHandler,
  isPending,
  isRunning,
  labels,
  runMatchesStatusFilter,
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import { sortRunsByStartTime } from '../../utils';
import { isWebSocketConnected } from '../../reducers';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun,
  startPipelineRun,
  useIsReadOnly,
  usePipelineRuns,
  useSelectedNamespace
} from '../../api';

export /* istanbul ignore next */ function PipelineRuns(props) {
  const {
    filters,
    history,
    intl,
    match,
    pipelineName,
    setStatusFilter,
    statusFilter,
    webSocketConnected
  } = props;

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = match.params;

  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  const isReadOnly = useIsReadOnly();

  useTitleSync({ page: 'PipelineRuns' });

  useEffect(() => {
    setDeleteError(null);
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }, [JSON.stringify(filters), namespace]);

  const {
    data: pipelineRuns = [],
    error,
    isLoading,
    refetch
  } = usePipelineRuns({ filters, namespace });

  useWebSocketReconnected(refetch, webSocketConnected);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.pipelineRuns.error',
          defaultMessage: 'Error loading PipelineRuns'
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

  function cancel(pipelineRun) {
    const { name, namespace: resourceNamespace } = pipelineRun.metadata;
    cancelPipelineRun({ name, namespace: resourceNamespace }).catch(err => {
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

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function deleteRun(pipelineRun) {
    const { name, namespace: resourceNamespace } = pipelineRun.metadata;
    deletePipelineRun({ name, namespace: resourceNamespace }).catch(err => {
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
    const deletions = toBeDeleted.map(resource => deleteRun(resource));
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  function openDeleteModal(selectedRows, handleCancel) {
    const pipelineRunsById = keyBy(pipelineRuns, 'metadata.uid');
    const resourcesToBeDeleted = selectedRows.map(
      ({ id }) => pipelineRunsById[id]
    );
    setShowDeleteModal(true);
    setToBeDeleted(resourcesToBeDeleted);
    setCancelSelection(() => handleCancel);
  }

  function pipelineRunActions() {
    if (isReadOnly) {
      return [];
    }

    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        action: rerunPipelineRun,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isPending(reason, status);
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.startPipelineRun.actionText',
          defaultMessage: 'Start'
        }),
        action: startPipelineRun,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isPending(reason, status);
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelPipelineRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status) && !isPending(reason, status);
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
        action: deleteRun,
        danger: true,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        hasDivider: true,
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
      }
    ];
  }

  sortRunsByStartTime(pipelineRuns);

  const toolbarButtons = isReadOnly
    ? []
    : [
        {
          onClick: () =>
            history.push(
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

  const batchActionButtons = isReadOnly
    ? []
    : [
        {
          onClick: openDeleteModal,
          text: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          icon: Delete
        }
      ];

  const filtersUI = (
    <StatusFilterDropdown
      id={generateId('status-filter-')}
      initialSelectedStatus={statusFilter}
      onChange={({ selectedItem }) => {
        setStatusFilter(selectedItem.id);
      }}
    />
  );

  return (
    <ListPageLayout {...props} error={getError()} title="PipelineRuns">
      <PipelineRunsList
        batchActionButtons={batchActionButtons}
        filters={filtersUI}
        loading={isLoading}
        pipelineRuns={pipelineRuns.filter(run => {
          return runMatchesStatusFilter({
            run,
            statusFilter
          });
        })}
        pipelineRunActions={pipelineRunActions()}
        selectedNamespace={namespace}
        toolbarButtons={toolbarButtons}
      />
      {showDeleteModal ? (
        <DeleteModal
          kind="PipelineRuns"
          onClose={closeDeleteModal}
          onSubmit={handleDelete}
          resources={toBeDeleted}
          showNamespace={namespace === ALL_NAMESPACES}
        />
      ) : null}
    </ListPageLayout>
  );
}

PipelineRuns.defaultProps = {
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);
  const statusFilter = getStatusFilter(props.location);

  const pipelineFilter =
    filters.find(filter => filter.indexOf(`${labels.PIPELINE}=`) !== -1) || '';
  const pipelineName = pipelineFilter.replace(`${labels.PIPELINE}=`, '');

  return {
    filters,
    pipelineName,
    setStatusFilter: getStatusFilterHandler(props),
    statusFilter,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(PipelineRuns));
