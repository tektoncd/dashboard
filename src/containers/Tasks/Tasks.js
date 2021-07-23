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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import { Button, Link as CarbonLink } from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getFilters,
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import {
  DeleteModal,
  FormattedDate,
  Table
} from '@tektoncd/dashboard-components';
import {
  TrashCan16 as DeleteIcon,
  Playlist16 as RunsIcon
} from '@carbon/icons-react';

import { ListPageLayout } from '..';
import {
  deleteTask,
  useIsReadOnly,
  useSelectedNamespace,
  useTasks
} from '../../api';
import { isWebSocketConnected } from '../../reducers';

/* istanbul ignore next */
function Tasks(props) {
  const { filters, intl, match, webSocketConnected } = props;

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = match.params;

  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);
  const [cancelSelection, setCancelSelection] = useState(null);

  const isReadOnly = useIsReadOnly();

  const { data: tasks = [], error, isLoading, refetch } = useTasks({
    filters,
    namespace
  });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.tasks.errorLoading',
          defaultMessage: 'Error loading Tasks'
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

  useTitleSync({ page: 'Tasks' });

  useWebSocketReconnected(refetch, webSocketConnected);

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function handleDeleteTask(task) {
    deleteTask({
      name: task.metadata.name,
      namespace: task.metadata.namespace
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
    const deletions = toBeDeleted.map(resource => handleDeleteTask(resource));
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  function openDeleteModal(selectedRows, handleCancelSelection) {
    const resourcesById = keyBy(tasks, 'metadata.uid');
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

  const tasksFormatted = tasks.map(task => ({
    id: task.metadata.uid,
    name: (
      <Link
        component={CarbonLink}
        to={urls.rawCRD.byNamespace({
          namespace: task.metadata.namespace,
          type: 'tasks',
          name: task.metadata.name
        })}
        title={task.metadata.name}
      >
        {task.metadata.name}
      </Link>
    ),
    namespace: task.metadata.namespace,
    createdTime: (
      <FormattedDate date={task.metadata.creationTimestamp} relative />
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
              openDeleteModal([{ id: task.metadata.uid }], () => {})
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
            { kind: 'TaskRuns', resource: task.metadata.name }
          )}
          kind="ghost"
          renderIcon={RunsIcon}
          size="sm"
          to={urls.taskRuns.byTask({
            namespace: task.metadata.namespace,
            taskName: task.metadata.name
          })}
          tooltipAlignment="center"
          tooltipPosition="left"
        />
      </>
    )
  }));

  return (
    <ListPageLayout {...props} error={getError()} title="Tasks">
      <Table
        batchActionButtons={batchActionButtons}
        className="tkn--table--inline-actions"
        headers={initialHeaders}
        rows={tasksFormatted}
        loading={isLoading}
        selectedNamespace={namespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'Tasks' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage:
              'No matching {kind} found in namespace {selectedNamespace}'
          },
          { kind: 'Tasks', selectedNamespace: namespace }
        )}
      />
      {showDeleteModal ? (
        <DeleteModal
          kind="Tasks"
          onClose={closeDeleteModal}
          onSubmit={handleDelete}
          resources={toBeDeleted}
          showNamespace={namespace === ALL_NAMESPACES}
        />
      ) : null}
    </ListPageLayout>
  );
}

Tasks.defaultProps = {
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);

  return {
    filters,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(Tasks));
