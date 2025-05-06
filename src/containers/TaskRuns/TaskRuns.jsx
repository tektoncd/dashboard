/*
Copyright 2019-2025 The Tekton Authors
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

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  DeleteModal,
  StatusFilterDropdown,
  TaskRuns as TaskRunsList
} from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  generateId,
  getFilters,
  getStatus,
  getStatusFilter,
  getStatusFilterHandler,
  isRunning,
  labels,
  runMatchesStatusFilter,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import { Add, TrashCan as Delete } from '@carbon/react/icons';

import ListPageLayout from '../ListPageLayout';
import { sortRunsByStartTime } from '../../utils';
import {
  cancelTaskRun,
  deleteTaskRun,
  rerunTaskRun,
  useIsReadOnly,
  useSelectedNamespace,
  useTaskRuns
} from '../../api';

const { TASK } = labels;

/* istanbul ignore next */
function TaskRuns() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const { namespace: namespaceParam } = params;
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;

  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);
  const [cancelSelection, setCancelSelection] = useState(null);

  const isReadOnly = useIsReadOnly();

  const filters = getFilters(location);
  const statusFilter = getStatusFilter(location);

  const taskFilter = filters.find(f => f.indexOf(`${TASK}=`) !== -1) || '';

  const taskName = taskFilter.replace(`${TASK}=`, '');

  const setStatusFilter = getStatusFilterHandler({ location, navigate });

  useTitleSync({ page: 'TaskRuns' });

  useEffect(() => {
    setDeleteError(null);
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }, [JSON.stringify(filters), namespace]);

  const {
    data: taskRuns = [],
    error,
    isLoading
  } = useTaskRuns({
    filters,
    namespace
  });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.taskRuns.errorLoading',
          defaultMessage: 'Error loading TaskRuns'
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

  function cancel(taskRun) {
    cancelTaskRun({
      name: taskRun.metadata.name,
      namespace: taskRun.metadata.namespace
    });
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function deleteTask(taskRun) {
    deleteTaskRun({
      name: taskRun.metadata.name,
      namespace: taskRun.metadata.namespace
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

  async function handleDelete() {
    const deletions = toBeDeleted.map(resource => deleteTask(resource));
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  function openDeleteModal(selectedRows, handleCancelSelection) {
    const taskRunsById = keyBy(taskRuns, 'metadata.uid');
    setShowDeleteModal(true);
    setToBeDeleted(selectedRows.map(({ id }) => taskRunsById[id]));
    setCancelSelection(() => handleCancelSelection);
  }

  function editAndRun(taskRun) {
    navigate(
      `${urls.taskRuns.create()}?mode=yaml&taskRunName=${
        taskRun.metadata.name
      }&namespace=${taskRun.metadata.namespace}`
    );
  }

  function taskRunActions() {
    if (isReadOnly) {
      return [];
    }
    return [
      {
        action: rerunTaskRun,
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        disable: resource => !!resource.metadata.labels?.['tekton.dev/pipeline']
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.editAndRun.actionText',
          defaultMessage: 'Edit and run'
        }),
        action: editAndRun,
        disable: resource => !!resource.metadata.labels?.['tekton.dev/pipeline']
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelTaskRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.heading',
            defaultMessage: 'Stop TaskRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelTaskRun.primaryText',
            defaultMessage: 'Stop TaskRun'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to stop TaskRun {name}?'
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
        action: deleteTask,
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
            { kind: 'TaskRuns' }
          ),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteTaskRun.body',
                defaultMessage:
                  'Are you sure you would like to delete TaskRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  }

  sortRunsByStartTime(taskRuns);

  const toolbarButtons = isReadOnly
    ? []
    : [
        {
          onClick: () => {
            let queryString;
            if (namespace !== ALL_NAMESPACES) {
              queryString = new URLSearchParams({
                ...(namespace !== ALL_NAMESPACES && { namespace }),
                ...(taskName && { taskName })
              }).toString();
            }
            navigate(
              urls.taskRuns.create() + (queryString ? `?${queryString}` : '')
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

  const statusFilters = (
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
      resources={taskRuns.filter(run => {
        return runMatchesStatusFilter({ run, statusFilter });
      })}
      title="TaskRuns"
    >
      {({ resources }) => (
        <>
          <TaskRunsList
            batchActionButtons={batchActionButtons}
            filters={statusFilters}
            getRunActions={taskRunActions}
            loading={isLoading}
            selectedNamespace={namespace}
            taskRuns={resources}
            toolbarButtons={toolbarButtons}
          />
          {showDeleteModal ? (
            <DeleteModal
              kind="TaskRuns"
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

export default TaskRuns;
