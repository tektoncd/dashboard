/*
Copyright 2022 The Tekton Authors
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
import { Link, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  ALL_NAMESPACES,
  getFilters,
  getStatus,
  isRunning,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import {
  Actions,
  Link as CustomLink,
  DeleteModal,
  FormattedDate,
  Table
} from '@tektoncd/dashboard-components';
import { TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import {
  deleteRun,
  useIsReadOnly,
  useRuns,
  useSelectedNamespace
} from '../../api';

function Runs({ intl }) {
  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);
  // TODO: add status filter (see PipelineRuns)

  useTitleSync({ page: 'Runs' });

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  const isReadOnly = useIsReadOnly();

  useEffect(() => {
    setDeleteError(null);
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }, [JSON.stringify(filters), namespace]);

  const {
    data: runs = [],
    error,
    isLoading
  } = useRuns({
    filters,
    namespace
  });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.runs.error',
          defaultMessage: 'Error loading Runs'
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

  function openDeleteModal(selectedRows, handleCancel) {
    const resourcesById = keyBy(runs, 'metadata.uid');
    const resourcesToBeDeleted = selectedRows.map(
      ({ id }) => resourcesById[id]
    );

    setShowDeleteModal(true);
    setToBeDeleted(resourcesToBeDeleted);
    setCancelSelection(() => handleCancel);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function deleteResource(run) {
    const { name, namespace: resourceNamespace } = run.metadata;
    return deleteRun({ name, namespace: resourceNamespace }).catch(err => {
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
    const deletions = toBeDeleted.map(resource => deleteResource(resource));
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  function getRunActions() {
    if (isReadOnly) {
      return [];
    }

    return [
      // TODO: rerun?
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: deleteResource,
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
            { kind: 'Runs' }
          ),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteRun.body',
                defaultMessage:
                  'Are you sure you would like to delete Run {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
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
      key: 'namespace',
      header: 'Namespace'
    },
    {
      key: 'date',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    }
  ];

  if (!isReadOnly) {
    initialHeaders.push({ key: 'actions', header: '' });
  }

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={runs}
      title="Runs"
    >
      {({ resources }) => {
        const runsFormatted = resources.map(run => {
          const runActions = getRunActions(run);
          return {
            id: run.metadata.uid,
            name: (
              <Link
                component={CustomLink}
                to={urls.runs.byName({
                  namespace: run.metadata.namespace,
                  runName: run.metadata.name
                })}
                title={run.metadata.name}
              >
                {run.metadata.name}
              </Link>
            ),
            namespace: run.metadata.namespace,
            date: (
              <FormattedDate date={run.metadata.creationTimestamp} relative />
            ),
            actions: runActions.length ? (
              <Actions items={runActions} resource={run} />
            ) : null
          };
        });

        return (
          <>
            <Table
              batchActionButtons={batchActionButtons}
              emptyTextAllNamespaces={intl.formatMessage(
                {
                  id: 'dashboard.emptyState.allNamespaces',
                  defaultMessage: 'No matching {kind} found'
                },
                { kind: 'Runs' }
              )}
              emptyTextSelectedNamespace={intl.formatMessage(
                {
                  id: 'dashboard.emptyState.selectedNamespace',
                  defaultMessage:
                    'No matching {kind} found in namespace {selectedNamespace}'
                },
                { kind: 'Runs', selectedNamespace }
              )}
              headers={initialHeaders}
              loading={isLoading}
              rows={runsFormatted}
              selectedNamespace={selectedNamespace}
            />
            {showDeleteModal ? (
              <DeleteModal
                kind="Runs"
                onClose={closeDeleteModal}
                onSubmit={handleDelete}
                resources={toBeDeleted}
                showNamespace={namespace === ALL_NAMESPACES}
              />
            ) : null}
          </>
        );
      }}
    </ListPageLayout>
  );
}

export default injectIntl(Runs);
