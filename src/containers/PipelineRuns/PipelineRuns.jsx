/*
Copyright 2019-2024 The Tekton Authors
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

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import { RadioTile, TileGroup } from '@carbon/react';
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
  preferences,
  runMatchesStatusFilter,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import ListPageLayout from '../ListPageLayout';
import { sortRunsByStartTime } from '../../utils';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun,
  startPipelineRun,
  useIsReadOnly,
  usePipelineRuns,
  useSelectedNamespace
} from '../../api';

export function PipelineRuns() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const filters = getFilters(location);
  const statusFilter = getStatusFilter(location);
  const setStatusFilter = getStatusFilterHandler({ location, navigate });

  const pipelineFilter =
    filters.find(filter => filter.indexOf(`${labels.PIPELINE}=`) !== -1) || '';
  const pipelineName = pipelineFilter.replace(`${labels.PIPELINE}=`, '');

  const [cancelSelection, setCancelSelection] = useState(null);
  const [cancelStatus, setCancelStatus] = useState('Cancelled');
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  const isReadOnly = useIsReadOnly();

  useTitleSync({ page: 'PipelineRuns' });

  useEffect(() => {
    const savedCancelStatus = localStorage.getItem(
      preferences.CANCEL_STATUS_KEY
    );
    if (savedCancelStatus) {
      setCancelStatus(savedCancelStatus);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(preferences.CANCEL_STATUS_KEY, cancelStatus);
  }, [cancelStatus]);

  useEffect(() => {
    setDeleteError(null);
    setShowDeleteModal(false);
    setToBeDeleted([]);
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
    // use value from localStorage to avoid stale value from closure
    const savedCancelStatus = localStorage.getItem(
      preferences.CANCEL_STATUS_KEY
    );
    const { name, namespace: resourceNamespace } = pipelineRun.metadata;
    cancelPipelineRun({
      name,
      namespace: resourceNamespace,
      status: savedCancelStatus
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

  function editAndRun(pipelineRun) {
    navigate(
      `${urls.pipelineRuns.create()}?mode=yaml&pipelineRunName=${
        pipelineRun.metadata.name
      }&namespace=${pipelineRun.metadata.namespace}`
    );
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
          id: 'dashboard.editAndRun.actionText',
          defaultMessage: 'Edit and run'
        }),
        action: editAndRun
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
          body: resource => (
            <>
              <p>
                {intl.formatMessage(
                  {
                    id: 'dashboard.cancelPipelineRun.body',
                    defaultMessage:
                      'Are you sure you would like to stop PipelineRun {name}?'
                  },
                  { name: resource.metadata.name }
                )}
              </p>
              <TileGroup
                legend={intl.formatMessage({
                  id: 'dashboard.tableHeader.status',
                  defaultMessage: 'Status'
                })}
                name="cancelStatus-group"
                valueSelected={cancelStatus}
                onChange={status => setCancelStatus(status)}
              >
                <RadioTile light name="cancelStatus" value="Cancelled">
                  <span>Cancelled</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.cancelled.description',
                      defaultMessage:
                        'Interrupt any currently executing tasks and skip finally tasks'
                    })}
                  </p>
                </RadioTile>
                <RadioTile
                  light
                  name="cancelStatus"
                  value="CancelledRunFinally"
                >
                  <span>CancelledRunFinally</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.cancelledRunFinally.description',
                      defaultMessage:
                        'Interrupt any currently executing non-finally tasks, then execute finally tasks'
                    })}
                  </p>
                </RadioTile>
                <RadioTile light name="cancelStatus" value="StoppedRunFinally">
                  <span>StoppedRunFinally</span>
                  <p className="tkn--tile--description">
                    {intl.formatMessage({
                      id: 'dashboard.cancelPipelineRun.stoppedRunFinally.description',
                      defaultMessage:
                        'Allow any currently executing tasks to complete but do not schedule any new non-finally tasks, then execute finally tasks'
                    })}
                  </p>
                </RadioTile>
              </TileGroup>
            </>
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
            navigate(
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

export default PipelineRuns;
