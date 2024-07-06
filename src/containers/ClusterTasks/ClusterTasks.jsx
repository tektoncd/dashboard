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

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  DeleteModal,
  FormattedDate,
  Link,
  Table
} from '@tektoncd/dashboard-components';
import { Button } from '@carbon/react';
import {
  TrashCan as DeleteIcon,
  PlayOutline as RunIcon,
  Playlist as RunsIcon
} from "@carbon/react/icons";
import { getFilters, urls, useTitleSync } from '@tektoncd/dashboard-utils';

import ListPageLayout from '../ListPageLayout';
import { deleteClusterTask, useClusterTasks, useIsReadOnly } from '../../api';

function getFormattedResources({
  intl,
  isReadOnly,
  openDeleteModal,
  resources
}) {
  return resources.map(clusterTask => ({
    id: clusterTask.metadata.uid,
    name: (
      <Link
        to={urls.clusterTasks.byName({
          name: clusterTask.metadata.name
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
              openDeleteModal([{ id: clusterTask.metadata.uid }], () => {})
            }
            renderIcon={DeleteIcon}
            size="sm"
            tooltipAlignment="center"
            tooltipPosition="left"
          />
        ) : null}
        {!isReadOnly ? (
          <Button
            as={Link}
            hasIconOnly
            iconDescription={intl.formatMessage(
              {
                id: 'dashboard.actions.createRunButton',
                defaultMessage: 'Create {kind}'
              },
              { kind: 'TaskRun' }
            )}
            kind="ghost"
            renderIcon={RunIcon}
            size="sm"
            to={`${urls.taskRuns.create()}?${new URLSearchParams({
              kind: 'ClusterTask',
              taskName: clusterTask.metadata.name
            }).toString()}`}
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
            { kind: 'TaskRuns', resource: clusterTask.metadata.name }
          )}
          kind="ghost"
          renderIcon={RunsIcon}
          size="sm"
          to={urls.taskRuns.byClusterTask({
            taskName: clusterTask.metadata.name
          })}
          tooltipAlignment="center"
          tooltipPosition="left"
        />
      </>
    )
  }));
}

function ClusterTasksContainer() {
  const intl = useIntl();
  const location = useLocation();
  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);
  const isReadOnly = useIsReadOnly();
  const filters = getFilters(location);

  useTitleSync({ page: 'ClusterTasks' });

  const {
    data: clusterTasks = [],
    error,
    isLoading
  } = useClusterTasks({
    filters
  });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.clusterTasks.errorLoading',
          defaultMessage: 'Error loading ClusterTasks'
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

  function handleDeleteClusterTask(clusterTask) {
    const { name, namespace } = clusterTask.metadata;
    deleteClusterTask({ name, namespace }).catch(err => {
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
      handleDeleteClusterTask(resource)
    );
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  async function openDeleteModal(selectedRows, handleCancelSelection) {
    const resourcesById = keyBy(clusterTasks, 'metadata.uid');
    setShowDeleteModal(true);
    setToBeDeleted(selectedRows.map(({ id }) => resourcesById[id]));
    setCancelSelection(() => handleCancelSelection);
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

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={clusterTasks}
      title="ClusterTasks"
    >
      {({ resources }) => (
        <>
          <Table
            batchActionButtons={batchActionButtons}
            className="tkn--table--inline-actions"
            headers={initialHeaders}
            rows={getFormattedResources({
              intl,
              isReadOnly,
              openDeleteModal,
              resources
            })}
            loading={isLoading}
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
            <DeleteModal
              kind="ClusterTasks"
              onClose={closeDeleteModal}
              onSubmit={handleDelete}
              resources={toBeDeleted}
              showNamespace={false}
            />
          ) : null}
        </>
      )}
    </ListPageLayout>
  );
}

export default ClusterTasksContainer;
