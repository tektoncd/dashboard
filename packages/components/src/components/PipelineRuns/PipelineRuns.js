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
import { StatusIcon, Table } from '@tektoncd/dashboard-components';
import { getStatus, urls } from '@tektoncd/dashboard-utils';
import { Pending24 as DefaultIcon } from '@carbon/icons-react';
import { Link as CarbonLink } from 'carbon-components-react';

import { FormattedDate, FormattedDuration, RunDropdown } from '..';

const PipelineRuns = ({
  batchActionButtons = [],
  createPipelineRunURL = urls.pipelineRuns.byName,
  createPipelineRunDisplayName = ({ pipelineRunMetadata }) =>
    pipelineRunMetadata.name,
  createPipelineRunsByPipelineURL = urls.pipelineRuns.byPipeline,
  filters,
  getPipelineRunStatus = (pipelineRun, intl) => {
    const { reason } = getStatus(pipelineRun);
    return (
      reason ||
      intl.formatMessage({
        id: 'dashboard.taskRun.status.pending',
        defaultMessage: 'Pending'
      })
    );
  },
  getPipelineRunStatusIcon = pipelineRun => {
    const { reason, status } = getStatus(pipelineRun);
    return (
      <StatusIcon DefaultIcon={DefaultIcon} reason={reason} status={status} />
    );
  },
  getPipelineRunStatusTooltip = (pipelineRun, intl) => {
    const { message } = getStatus(pipelineRun);
    const reason = getPipelineRunStatus(pipelineRun, intl);
    if (!message) {
      return reason;
    }
    return `${reason}: ${message}`;
  },
  getPipelineRunCreatedTime = pipelineRun =>
    pipelineRun.metadata.creationTimestamp,
  getPipelineRunId = pipelineRun => pipelineRun.metadata.uid,
  columns = [
    'status',
    'name',
    'pipeline',
    'namespace',
    'createdTime',
    'duration'
  ],
  customColumns = {},
  intl,
  loading,
  selectedNamespace,
  pipelineRuns,
  pipelineRunActions = [],
  skeletonRowCount,
  toolbarButtons
}) => {
  const defaultHeaders = {
    status: intl.formatMessage({
      id: 'dashboard.tableHeader.status',
      defaultMessage: 'Status'
    }),
    name: intl.formatMessage({
      id: 'dashboard.tableHeader.name',
      defaultMessage: 'Name'
    }),
    pipeline: intl.formatMessage({
      id: 'dashboard.tableHeader.pipeline',
      defaultMessage: 'Pipeline'
    }),
    namespace: 'Namespace',
    createdTime: intl.formatMessage({
      id: 'dashboard.tableHeader.createdTime',
      defaultMessage: 'Created'
    }),
    duration: intl.formatMessage({
      id: 'dashboard.tableHeader.duration',
      defaultMessage: 'Duration'
    })
  };

  const headers = columns.map(column => {
    const header =
      (customColumns[column] && customColumns[column].header) ||
      defaultHeaders[column];
    return {
      key: column,
      header
    };
  });

  if (pipelineRunActions.length) {
    headers.push({ key: 'actions', header: '' });
  }

  function getCustomColumnValues(pipelineRun) {
    return Object.keys(customColumns).reduce((acc, column) => {
      if (customColumns[column].getValue) {
        acc[column] = customColumns[column].getValue({ pipelineRun });
      }
      return acc;
    }, {});
  }

  const pipelineRunsFormatted = pipelineRuns.map(pipelineRun => {
    const { annotations, namespace } = pipelineRun.metadata;
    const creationTimestamp = getPipelineRunCreatedTime(pipelineRun);
    const pipelineRunName = createPipelineRunDisplayName({
      pipelineRunMetadata: pipelineRun.metadata
    });
    const pipelineRefName =
      pipelineRun.spec.pipelineRef && pipelineRun.spec.pipelineRef.name;
    const pipelineRunType = pipelineRun.spec.type;
    const { lastTransitionTime, reason, status } = getStatus(pipelineRun);
    const statusIcon = getPipelineRunStatusIcon(pipelineRun);
    const pipelineRunURL = createPipelineRunURL({
      namespace,
      pipelineRunName,
      annotations
    });
    const pipelineRunsByPipelineURL =
      pipelineRefName &&
      createPipelineRunsByPipelineURL({
        namespace,
        pipelineName: pipelineRefName
      });

    let endTime = Date.now();
    if (status === 'False' || status === 'True') {
      endTime = new Date(lastTransitionTime).getTime();
    }

    const duration = (
      <FormattedDuration
        milliseconds={endTime - new Date(creationTimestamp).getTime()}
      />
    );

    return {
      id: getPipelineRunId(pipelineRun),
      name: pipelineRunURL ? (
        <Link
          component={CarbonLink}
          to={pipelineRunURL}
          title={pipelineRunName}
        >
          {pipelineRunName}
        </Link>
      ) : (
        pipelineRunName
      ),
      pipeline:
        pipelineRefName &&
        (pipelineRunsByPipelineURL ? (
          <Link
            component={CarbonLink}
            to={pipelineRunsByPipelineURL}
            title={pipelineRefName}
          >
            {pipelineRefName}
          </Link>
        ) : (
          pipelineRefName
        )),
      namespace,
      status: (
        <div className="tkn--definition">
          <div
            className="tkn--status"
            data-status={status}
            data-reason={reason}
            title={getPipelineRunStatusTooltip(pipelineRun, intl)}
          >
            {statusIcon}
          </div>
        </div>
      ),
      createdTime: <FormattedDate date={creationTimestamp} relative />,
      duration,
      type: pipelineRunType,
      actions: pipelineRunActions.length && (
        <RunDropdown items={pipelineRunActions} resource={pipelineRun} />
      ),
      ...getCustomColumnValues(pipelineRun)
    };
  });

  return (
    <Table
      batchActionButtons={batchActionButtons}
      filters={filters}
      headers={headers}
      rows={pipelineRunsFormatted}
      loading={loading}
      selectedNamespace={selectedNamespace}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No matching {kind} found'
        },
        { kind: 'PipelineRuns' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage:
            'No matching {kind} found in namespace {selectedNamespace}'
        },
        { kind: 'PipelineRuns', selectedNamespace }
      )}
      skeletonRowCount={skeletonRowCount}
      toolbarButtons={toolbarButtons}
    />
  );
};

export default injectIntl(PipelineRuns);
