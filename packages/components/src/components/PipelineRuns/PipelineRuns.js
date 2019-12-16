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
      key: 'dropdown',
      header: ''
    }
  ];

  const headers = [];
  initialHeaders.forEach(header => {
    if (header.key !== undefined) {
      headers.push(header);
    }
  });

  const pipelineRunsFormatted = pipelineRuns.map(pipelineRun => {
    const { namespace, annotations } = pipelineRun.metadata;
    const pipelineRunName = createPipelineRunDisplayName({
      pipelineRunMetadata: pipelineRun.metadata
    });
    const pipelineRefName = pipelineRun.spec.pipelineRef.name;
    const pipelineRunType = pipelineRun.spec.type;
    const { reason, status } = getStatus(pipelineRun);
    const statusIcon = getPipelineRunStatusIcon(pipelineRun);
    const pipelineRunStatus = getPipelineRunStatus(pipelineRun, intl);
    const url = createPipelineRunURL({
      namespace,
      pipelineRunName,
      annotations
    });
    return {
      id: `${namespace}:${pipelineRunName}`,
      name: url ? <Link to={url}>{pipelineRunName}</Link> : pipelineRunName,
      pipeline:
        !hidePipeline &&
        (pipelineRefName ? (
          <Link
            to={createPipelineRunsByPipelineURL({
              namespace,
              pipelineName: pipelineRefName
            })}
          >
            {pipelineRefName}
          </Link>
        ) : (
          ''
        )),
      namespace: !hideNamespace && namespace,
      status: (
        <div className="definition">
          <div className="status" data-status={status} data-reason={reason}>
            {statusIcon}
            {pipelineRunStatus}
          </div>
        </div>
      ),
      transitionTime: (
        <FormattedDate
          date={createPipelineRunTimestamp(pipelineRun)}
          relative
        />
      ),
      type: pipelineRunType,
      dropdown: (
        <RunDropdown items={pipelineRunActions} resource={pipelineRun} />
      )
    };
  });

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
