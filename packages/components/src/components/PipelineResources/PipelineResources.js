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

import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';
import { Link as CarbonLink } from 'carbon-components-react';

import { FormattedDate, Table } from '..';

const PipelineResources = ({
  batchActionButtons,
  createPipelineResourcesURL = urls.pipelineResources.byName,
  createPipelineResourceDisplayName = ({ pipelineResourceMetadata }) =>
    pipelineResourceMetadata.name,
  intl,
  loading,
  pipelineResources,
  selectedNamespace,
  toolbarButtons
}) => {
  const headers = [
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
      key: 'type',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.type',
        defaultMessage: 'Type'
      })
    },
    {
      key: 'createdTime',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    }
  ];

  const pipelineResourcesFormatted = pipelineResources.map(pipelineResource => {
    const { namespace } = pipelineResource.metadata;
    const pipelineResourceName = createPipelineResourceDisplayName({
      pipelineResourceMetadata: pipelineResource.metadata
    });
    const url = createPipelineResourcesURL({
      namespace,
      pipelineResourceName
    });

    return {
      id: pipelineResource.metadata.uid,
      name: url ? (
        <Link component={CarbonLink} to={url} title={pipelineResourceName}>
          {pipelineResourceName}
        </Link>
      ) : (
        pipelineResourceName
      ),
      namespace,
      type: pipelineResource.spec.type,
      createdTime: (
        <FormattedDate
          date={pipelineResource.metadata.creationTimestamp}
          relative
        />
      )
    };
  });

  return (
    <Table
      batchActionButtons={batchActionButtons}
      headers={headers}
      rows={pipelineResourcesFormatted}
      loading={loading}
      selectedNamespace={selectedNamespace}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No matching {kind} found'
        },
        { kind: 'PipelineResources' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage:
            'No matching {kind} found in namespace {selectedNamespace}'
        },
        { kind: 'PipelineResources', selectedNamespace }
      )}
      toolbarButtons={toolbarButtons}
    />
  );
};

export default injectIntl(PipelineResources);
