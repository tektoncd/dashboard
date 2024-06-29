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

import { useIntl } from 'react-intl';
import { getStatus, urls } from '@tektoncd/dashboard-utils';
import {
  Calendar16 as CalendarIcon,
  Pending24 as DefaultIcon,
  Time16 as TimeIcon,
  Lightning16 as TriggersIcon
} from '@carbon/icons-react';

import Actions from '../Actions';
import FormattedDate from '../FormattedDate';
import FormattedDuration from '../FormattedDuration';
import Link from '../Link';
import StatusIcon from '../StatusIcon';
import Table from '../Table';

function getDefaultPipelineRunStatusDetail(pipelineRun) {
  const { status } = getStatus(pipelineRun);
  return status === 'False' ? (
    <span className="tkn--table--sub" title={getStatus(pipelineRun).message}>
      {getStatus(pipelineRun).message}&nbsp;
    </span>
  ) : (
    <span className="tkn--table--sub">&nbsp;</span>
  );
}

const PipelineRuns = ({
  batchActionButtons = [],
  columns = ['run', 'status', 'pipeline', 'time'],
  customColumns = {},
  filters,
  getPipelineRunCreatedTime = pipelineRun =>
    pipelineRun.metadata.creationTimestamp,
  getPipelineRunDisplayName = ({ pipelineRunMetadata }) =>
    pipelineRunMetadata.name,
  getPipelineRunDisplayNameTooltip = getPipelineRunDisplayName,
  getPipelineRunDuration = pipelineRun => {
    const creationTimestamp = getPipelineRunCreatedTime(pipelineRun);
    const { lastTransitionTime, status } = getStatus(pipelineRun);

    let endTime = Date.now();
    if (status === 'False' || status === 'True') {
      endTime = new Date(lastTransitionTime).getTime();
    }

    return endTime - new Date(creationTimestamp).getTime();
  },
  getPipelineRunIcon = () => null,
  getPipelineRunId = pipelineRun => pipelineRun.metadata.uid,
  getPipelineRunsByPipelineURL = urls.pipelineRuns.byPipeline,
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
  getPipelineRunStatusDetail = getDefaultPipelineRunStatusDetail,
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
  getPipelineRunTriggerInfo = pipelineRun => {
    const { labels = {} } = pipelineRun.metadata;
    const eventListener = labels['triggers.tekton.dev/eventlistener'];
    const trigger = labels['triggers.tekton.dev/trigger'];
    if (!eventListener && !trigger) {
      return null;
    }

    return (
      <span
        title={`EventListener: ${eventListener || '-'}\nTrigger: ${
          trigger || '-'
        }`}
      >
        <TriggersIcon />
        {eventListener}
        {eventListener && trigger ? ' | ' : ''}
        {trigger}
      </span>
    );
  },
  getPipelineRunURL = urls.pipelineRuns.byName,
  getRunActions = () => [],
  loading,
  pipelineRuns,
  selectedNamespace,
  skeletonRowCount,
  toolbarButtons
}) => {
  const intl = useIntl();
  let hasRunActions = false;
  const defaultHeaders = {
    pipeline: intl.formatMessage({
      id: 'dashboard.tableHeader.pipeline',
      defaultMessage: 'Pipeline'
    }),
    run: 'Run',
    status: intl.formatMessage({
      id: 'dashboard.tableHeader.status',
      defaultMessage: 'Status'
    }),
    time: ''
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
    const pipelineRunName = getPipelineRunDisplayName({
      pipelineRunMetadata: pipelineRun.metadata
    });
    const pipelineRunNameTooltip = getPipelineRunDisplayNameTooltip({
      pipelineRunMetadata: pipelineRun.metadata
    });
    const pipelineRefName =
      pipelineRun.spec.pipelineRef && pipelineRun.spec.pipelineRef.name;
    const { reason, status } = getStatus(pipelineRun);
    const statusIcon = getPipelineRunStatusIcon(pipelineRun);
    const pipelineRunURL = getPipelineRunURL({
      name: pipelineRunName,
      namespace,
      annotations
    });
    const pipelineRunsByPipelineURL =
      pipelineRefName &&
      getPipelineRunsByPipelineURL({
        namespace,
        pipelineName: pipelineRefName
      });

    let duration = getPipelineRunDuration(pipelineRun);
    // zero is a valid duration
    if (duration == null) {
      duration = '-';
    } else {
      duration = <FormattedDuration milliseconds={duration} />;
    }

    const pipelineRunActions = getRunActions(pipelineRun);
    if (pipelineRunActions.length) {
      hasRunActions = true;
    }

    return {
      id: getPipelineRunId(pipelineRun),
      run: (
        <div>
          <span>
            {pipelineRunURL ? (
              <Link to={pipelineRunURL} title={pipelineRunNameTooltip}>
                {pipelineRunName}
              </Link>
            ) : (
              pipelineRunName
            )}
            {getPipelineRunIcon({
              pipelineRunMetadata: pipelineRun.metadata
            })}
          </span>
          <span className="tkn--table--sub">
            {getPipelineRunTriggerInfo(pipelineRun)}&nbsp;
          </span>
        </div>
      ),
      pipeline: (
        <div>
          <span>
            {(pipelineRefName &&
              (pipelineRunsByPipelineURL ? (
                <Link to={pipelineRunsByPipelineURL} title={pipelineRefName}>
                  {pipelineRefName}
                </Link>
              ) : (
                <span title={`Pipeline: ${pipelineRefName || '-'}`}>
                  {pipelineRefName}
                </span>
              ))) ||
              '-'}
          </span>
          <span className="tkn--table--sub" title={`Namespace: ${namespace}`}>
            {namespace}&nbsp;
          </span>
        </div>
      ),
      status: (
        <div>
          <div className="tkn--definition">
            <div
              className="tkn--status"
              data-status={status}
              data-reason={reason}
              title={getPipelineRunStatusTooltip(pipelineRun, intl)}
            >
              {statusIcon}
              {getPipelineRunStatus(pipelineRun, intl)}
            </div>
          </div>
          {getPipelineRunStatusDetail(pipelineRun) ||
            getDefaultPipelineRunStatusDetail(pipelineRun)}
        </div>
      ),
      time: (
        <div>
          <span>
            <CalendarIcon />
            <FormattedDate
              date={creationTimestamp}
              formatTooltip={formattedDate =>
                intl.formatMessage(
                  {
                    id: 'dashboard.resource.createdTime',
                    defaultMessage: 'Created: {created}'
                  },
                  {
                    created: formattedDate
                  }
                )
              }
            />
          </span>
          <div className="tkn--table--sub">
            <TimeIcon />
            {duration}
          </div>
        </div>
      ),
      actions: pipelineRunActions.length && (
        <Actions items={pipelineRunActions} resource={pipelineRun} />
      ),
      ...getCustomColumnValues(pipelineRun)
    };
  });

  if (hasRunActions) {
    headers.push({ key: 'actions', header: '' });
  }

  return (
    <Table
      batchActionButtons={batchActionButtons}
      filters={filters}
      hasDetails
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

export default PipelineRuns;
