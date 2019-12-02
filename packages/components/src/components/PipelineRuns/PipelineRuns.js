/*
Copyright 2019 The Tekton Authors
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
import { Table } from '@tektoncd/dashboard-components';
import 'carbon-components-react';
import { getStatus, getStatusIcon, urls } from '@tektoncd/dashboard-utils';

import { FormattedDate, RunDropdown } from '..';

import './PipelineRuns.scss';

const PipelineRuns = ({
  createPipelineRunURL = urls.pipelineRuns.byName,
  createPipelineRunDisplayName = ({ pipelineRunMetadata }) =>
    pipelineRunMetadata.name,
  createPipelineRunTimestamp = pipelineRun =>
    getStatus(pipelineRun).lastTransitionTime,
  createPipelineRunsByPipelineURL = urls.pipelineRuns.byPipeline,
  getPipelineRunStatus = (pipelineRun, intl) =>
    pipelineRun.status && pipelineRun.status.conditions
      ? pipelineRun.status.conditions[0].message
      : intl.formatMessage({
          id: 'dashboard.pipelineRuns.status.pending',
          defaultMessage: 'Pending'
        }),
  getPipelineRunStatusIcon = pipelineRun => {
    const { reason, status } = getStatus(pipelineRun);
    return getStatusIcon({ reason, status });
  },
  hideNamespace,
  hidePipeline,
  intl,
  loading,
  selectedNamespace,
  pipelineRuns,
  pipelineRunActions
}) => {
  const initialHeaders = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    !hidePipeline && {
      key: 'pipeline',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.pipeline',
        defaultMessage: 'Pipeline'
      })
    },
    !hideNamespace && {
      key: 'namespace',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.namespace',
        defaultMessage: 'Namespace'
      })
    },
    {
      key: 'status',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.status',
        defaultMessage: 'Status'
      })
    },
    {
      key: 'transitionTime',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.transitionTime',
        defaultMessage: 'Last Transition Time'
      })
    },
    {
      key: 'dropdown'
    }
  ];

  const headers = [];
  initialHeaders.forEach(header => {
    if (header.key !== undefined) {
      headers.push(header);
    }
  });

  const pipelineRunsFormatted = pipelineRuns.map(pipelineRun => ({
    id: `${pipelineRun.metadata.namespace}:${pipelineRun.metadata.name}`,
    name: (
      <Link
        to={createPipelineRunURL({
          namespace: pipelineRun.metadata.namespace,
          pipelineRunName: createPipelineRunDisplayName({
            pipelineRunMetadata: pipelineRun.metadata
          })
        })}
      >
        {pipelineRun.metadata.name}
      </Link>
    ),
    pipeline: !hidePipeline && (
      <Link
        to={createPipelineRunsByPipelineURL({
          namespace: pipelineRun.metadata.namespace,
          pipelineName: pipelineRun.spec.pipelineRef.name
        })}
      >
        {pipelineRun.spec.pipelineRef.name}
      </Link>
    ),
    namespace: !hideNamespace && pipelineRun.metadata.namespace,
    status: (
      <div className="definition">
        <div
          className="status"
          data-status={getStatus(pipelineRun).status}
          data-reason={getStatus(pipelineRun).reason}
        >
          <div className="status-icon">
            {getPipelineRunStatusIcon(pipelineRun)}
          </div>
          {getPipelineRunStatus(pipelineRun, intl)}
        </div>
      </div>
    ),
    transitionTime: (
      <FormattedDate date={createPipelineRunTimestamp(pipelineRun)} relative />
    ),
    type: pipelineRun.spec.type,
    dropdown: <RunDropdown items={pipelineRunActions} resource={pipelineRun} />
  }));

  return (
    <Table
      headers={headers}
      rows={pipelineRunsFormatted}
      loading={loading}
      selectedNamespace={selectedNamespace}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No {kind} under any namespace.'
        },
        { kind: 'PipelineRuns' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage: 'No {kind} under namespace {selectedNamespace}'
        },
        { kind: 'PipelineRuns', selectedNamespace }
      )}
    />
  );
};

export default injectIntl(PipelineRuns);
