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
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import { sortRunsByStartTime } from '../../utils';
import { isWebSocketConnected } from '../../reducers';
import {
  cancelTaskRun,
  deleteTaskRun,
  rerunTaskRun,
  useIsReadOnly,
  useSelectedNamespace,
  useTaskRuns
} from '../../api';

const { CLUSTER_TASK, TASK } = labels;

/* istanbul ignore next */
function TaskRuns(props) {
  const {
    filters,
    history,
    intl,
    kind,
    match,
    setStatusFilter,
    statusFilter,
    taskName,
    webSocketConnected
  } = props;

  const { namespace: namespaceParam } = match.params;
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;

  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);
  const [cancelSelection, setCancelSelection] = useState(null);

  const isReadOnly = useIsReadOnly();

  useTitleSync({ page: 'TaskRuns' });

  useEffect(() => {
    setDeleteError(null);
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }, [JSON.stringify(filters), namespace]);

  const { data: taskRuns = [], error, isLoading, refetch } = useTaskRuns({
    filters,
    namespace
  });

  useWebSocketReconnected(refetch, webSocketConnected);

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

  function rerun(taskRun) {
    rerunTaskRun(taskRun);
  }

  function taskRunActions() {
    if (isReadOnly) {
      return [];
    }
    return [
      {
        action: rerun,
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
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
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
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
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
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
          onClick: () =>
            history.push(
              urls.taskRuns.create() +
                (taskName ? `?taskName=${taskName}&kind=${kind}` : '')
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
    <ListPageLayout {...props} error={getError()} title="TaskRuns">
      <TaskRunsList
        batchActionButtons={batchActionButtons}
        filters={statusFilters}
        loading={isLoading}
        selectedNamespace={namespace}
        taskRuns={taskRuns.filter(run => {
          return runMatchesStatusFilter({ run, statusFilter });
        })}
        taskRunActions={taskRunActions()}
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
    </ListPageLayout>
  );
}

TaskRuns.defaultProps = {
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);
  const statusFilter = getStatusFilter(props.location);

  const taskFilter = filters.find(f => f.indexOf(`${TASK}=`) !== -1) || '';
  const clusterTaskFilter =
    filters.find(f => f.indexOf(`${CLUSTER_TASK}=`) !== -1) || '';
  const kind = clusterTaskFilter ? 'ClusterTask' : 'Task';

  const taskName =
    kind === 'ClusterTask'
      ? clusterTaskFilter.replace(`${CLUSTER_TASK}=`, '')
      : taskFilter.replace(`${TASK}=`, '');

  return {
    filters,
    taskName,
    kind,
    setStatusFilter: getStatusFilterHandler(props),
    statusFilter,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(TaskRuns));
