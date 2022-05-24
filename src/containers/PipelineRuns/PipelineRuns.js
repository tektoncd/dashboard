/*
Copyright 2019-2022 The Tekton Authors
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
/* istanbul ignore file */

import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  DeleteModal,
  PipelineRuns as PipelineRunsList,
  RadioGroup,
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
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import {
  getDefaultCancelState,
  setDefaultCancelState,
  sortRunsByStartTime
} from '../../utils';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun,
  startPipelineRun,
  useIsReadOnly,
  usePipelineRuns,
  useProperties,
  useSelectedNamespace
} from '../../api';

export function PipelineRuns({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const { data } = useProperties();

  const { pipelinesVersion } = data;
  const versionCheck = parseInt(pipelinesVersion.split('.')[1], 10);
  const allowCancelOptions = !Number.isNaN(versionCheck) && versionCheck > 34;
  const [cancelState, setCancelState] = useState(
    getDefaultCancelState(allowCancelOptions)
  );
  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const filters = getFilters(location);
  const statusFilter = getStatusFilter(location);
  const setStatusFilter = getStatusFilterHandler({ history, location });

  const pipelineFilter =
    filters.find(filter => filter.indexOf(`${labels.PIPELINE}=`) !== -1) || '';
  const pipelineName = pipelineFilter.replace(`${labels.PIPELINE}=`, '');

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
    setCancelState(getDefaultCancelState(allowCancelOptions));
  }, [JSON.stringify(filters), namespace]);

  const {
    data: pipelineRuns = [],
    error,
    isLoading
  } = usePipelineRuns({
    filters,
    namespace
  });

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
    cancelPipelineRun({
      name,
      namespace: resourceNamespace,
      cancelState
    }).catch(err => {
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

  function persistCancelState(state) {
    setCancelState(state);
    setDefaultCancelState(state);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function buildCancelStateList(allowChoice) {
    const cancelLabel = intl.formatMessage({
      id: 'dashboard.canceledPipelineRunStatus.body',
      defaultMessage: 'Cancel'
    });

    const canceledWithFinally = intl.formatMessage({
      id: 'dashboard.canceledWithFinallyPipelineRun.body',
      defaultMessage: 'Cancel with Finally'
    });

    const stoppedLabel = intl.formatMessage({
      id: 'dashboard.stopWithFinallyPipelineRunStatus.body',
      defaultMessage: 'Stop with Finally'
    });
    const options = [
      {
        icon: Info,
        label: cancelLabel,
        value: allowChoice ? 'Cancelled' : 'PipelineRunCancelled'
      },
      {
        icon: Info,
        label: canceledWithFinally,
        value: 'CancelledRunFinally',
        disabled: !allowChoice
      },
      {
        icon: Info,
        label: stoppedLabel,
        value: 'StoppedRunFinally',
        disabled: !allowChoice
      }
    ];
    return options;
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
        action: pipeline => cancel(pipeline, cancelState),
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
          body: resource => {
            const title = intl.formatMessage(
              {
                id: 'dashboard.cancelPipelineRun.body',
                defaultMessage:
                  'Are you sure you would like to stop PipelineRun {name}?'
              },
              { name: resource.metadata.name }
            );

            return (
              <RadioGroup
                orientation="vertical"
                defaultSelected={cancelState}
                getSelected={persistCancelState}
                options={buildCancelStateList(allowCancelOptions)}
                title={title}
              />
            );
          }
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
          onClick: () => {
            let queryString;
            if (namespace !== ALL_NAMESPACES) {
              queryString = new URLSearchParams({
                namespace,
                ...(pipelineName && { pipelineName })
              }).toString();
            }
            history.push(
              urls.pipelineRuns.create() +
                (queryString ? `?${queryString}` : '')
            );
          },
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
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={pipelineRuns.filter(run => {
        return runMatchesStatusFilter({
          run,
          statusFilter
        });
      })}
      title="PipelineRuns"
    >
      {({ resources }) => (
        <>
          <PipelineRunsList
            batchActionButtons={batchActionButtons}
            filters={filtersUI}
            getRunActions={pipelineRunActions}
            loading={isLoading}
            pipelineRuns={resources}
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
        </>
      )}
    </ListPageLayout>
  );
}

export default injectIntl(PipelineRuns);
