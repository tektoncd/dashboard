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
import { useLocation, useParams } from 'react-router-dom';
import {
  TrashCan16 as DeleteIcon,
  PlayOutline16 as RunIcon,
  Playlist16 as RunsIcon
} from '@carbon/icons-react';
import { useIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import { Button } from 'carbon-components-react';
import {
  ALL_NAMESPACES,
  getFilters,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import {
  DeleteModal,
  FormattedDate,
  Link,
  Table
} from '@tektoncd/dashboard-components';

import ListPageLayout from '../ListPageLayout';
import {
  deletePipeline,
  useIsReadOnly,
  usePipelines,
  useSelectedNamespace
} from '../../api';

function getFormattedResources({
  intl,
  isReadOnly,
  openDeleteModal,
  resources
}) {
  return resources.map(pipeline => ({
    id: pipeline.metadata.uid,
    name: (
      <Link
        to={urls.pipelines.byName({
          name: pipeline.metadata.name,
          namespace: pipeline.metadata.namespace
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
        {!isReadOnly ? (
          <Button
            as={Link}
            hasIconOnly
            iconDescription={intl.formatMessage(
              {
                id: 'dashboard.actions.createRunButton',
                defaultMessage: 'Create {kind}'
              },
              { kind: 'PipelineRun' }
            )}
            kind="ghost"
            renderIcon={RunIcon}
            size="sm"
            to={`${urls.pipelineRuns.create()}?${new URLSearchParams({
              namespace: pipeline.metadata.namespace,
              pipelineName: pipeline.metadata.name
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
}

export function Pipelines() {
  const intl = useIntl();
  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  const isReadOnly = useIsReadOnly();

  useTitleSync({ page: 'Pipelines' });

  const {
    data: pipelines = [],
    error,
    isLoading
  } = usePipelines({
    filters,
    namespace
  });

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

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={pipelines}
      title="Pipelines"
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
        </>
      )}
    </ListPageLayout>
  );
}

export default Pipelines;
