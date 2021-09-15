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
/* istanbul ignore file */

import React, { useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  ALL_NAMESPACES,
  getFilters,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import {
  DeleteModal,
  PipelineResources as PipelineResourcesList
} from '@tektoncd/dashboard-components';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';

import { ListPageLayout } from '..';
import {
  deletePipelineResource,
  useIsReadOnly,
  usePipelineResources,
  useSelectedNamespace
} from '../../api';

export function PipelineResources({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  const isReadOnly = useIsReadOnly();

  useTitleSync({ page: 'PipelineResources' });

  const {
    data: pipelineResources = [],
    error,
    isLoading
  } = usePipelineResources({ filters, namespace });

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.pipelineResources.error',
          defaultMessage: 'Error loading PipelineResources'
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
    const pipelineResourcesById = keyBy(pipelineResources, 'metadata.uid');
    const resourcesToBeDeleted = selectedRows.map(
      ({ id }) => pipelineResourcesById[id]
    );

    setIsDeleteModalOpen(true);
    setToBeDeleted(resourcesToBeDeleted);
    setCancelSelection(() => handleCancel);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setToBeDeleted([]);
  }

  function deleteResource(pipelineResource) {
    const { name, namespace: resourceNamespace } = pipelineResource.metadata;
    return deletePipelineResource({ name, namespace: resourceNamespace }).catch(
      err => {
        err.response.text().then(text => {
          const statusCode = err.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setDeleteError(errorMessage);
        });
      }
    );
  }

  async function handleDelete() {
    const deletions = toBeDeleted.map(resource => deleteResource(resource));
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  const toolbarButtons = isReadOnly
    ? []
    : [
        {
          onClick: () => history.push(urls.pipelineResources.create()),
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

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      title="PipelineResources"
    >
      <PipelineResourcesList
        batchActionButtons={batchActionButtons}
        loading={isLoading}
        pipelineResources={pipelineResources}
        selectedNamespace={namespace}
        toolbarButtons={toolbarButtons}
      />
      {isDeleteModalOpen ? (
        <DeleteModal
          kind="PipelineResources"
          onClose={closeDeleteModal}
          onSubmit={handleDelete}
          resources={toBeDeleted}
          showNamespace={namespace === ALL_NAMESPACES}
        />
      ) : null}
    </ListPageLayout>
  );
}

export default injectIntl(PipelineResources);
