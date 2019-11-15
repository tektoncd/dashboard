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
import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper
} from 'carbon-components-react';
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
  intl,
  pipelineName,
  pipelineRuns,
  pipelineRunActions
}) => (
  <StructuredListWrapper border selection>
    <StructuredListHead>
      <StructuredListRow head>
        <StructuredListCell head>PipelineRun</StructuredListCell>
        {!pipelineName && (
          <StructuredListCell head>Pipeline</StructuredListCell>
        )}
        {!hideNamespace && (
          <StructuredListCell head>Namespace</StructuredListCell>
        )}
        <StructuredListCell head>
          {intl.formatMessage({
            id: 'dashboard.pipelineRuns.status',
            defaultMessage: 'Status'
          })}
        </StructuredListCell>
        <StructuredListCell head>
          {intl.formatMessage({
            id: 'dashboard.pipelineRuns.transitionTime',
            defaultMessage: 'Last Transition Time'
          })}
        </StructuredListCell>
        {pipelineRunActions && <StructuredListCell head />}
      </StructuredListRow>
    </StructuredListHead>
    <StructuredListBody>
      {!pipelineRuns.length && (
        <StructuredListRow>
          <StructuredListCell>
            {pipelineName ? (
              <span>
                {intl.formatMessage(
                  {
                    id: 'dashboard.pipelineRuns.noPipelineRunsForPipeline',
                    defaultMessage: 'No PipelineRuns for {pipelineName}'
                  },
                  { pipelineName }
                )}
              </span>
            ) : (
              <span>
                {intl.formatMessage({
                  id: 'dashboard.pipelineRuns.noPipelineRuns',
                  defaultMessage: 'No PipelineRuns'
                })}
              </span>
            )}
          </StructuredListCell>
        </StructuredListRow>
      )}
      {pipelineRuns.map((pipelineRun, index) => {
        const { namespace, annotations } = pipelineRun.metadata;
        const pipelineRunName = createPipelineRunDisplayName({
          pipelineRunMetadata: pipelineRun.metadata
        });
        const pipelineRefName = pipelineRun.spec.pipelineRef.name;
        const { reason, status } = getStatus(pipelineRun);
        const statusIcon = getPipelineRunStatusIcon(pipelineRun);
        const pipelineRunStatus = getPipelineRunStatus(pipelineRun, intl);
        const url = createPipelineRunURL({
          namespace,
          pipelineRunName,
          annotations
        });

        return (
          <StructuredListRow
            className="definition"
            key={pipelineRun.metadata.uid || index}
          >
            <StructuredListCell>
              {url ? <Link to={url}>{pipelineRunName}</Link> : pipelineRunName}
            </StructuredListCell>
            {!pipelineName && (
              <StructuredListCell>
                <Link
                  to={createPipelineRunsByPipelineURL({
                    namespace,
                    pipelineName: pipelineRefName
                  })}
                >
                  {pipelineRefName}
                </Link>
              </StructuredListCell>
            )}
            {!hideNamespace && (
              <StructuredListCell>{namespace}</StructuredListCell>
            )}
            <StructuredListCell
              className="status"
              data-reason={reason}
              data-status={status}
            >
              {statusIcon}
              {pipelineRunStatus}
            </StructuredListCell>
            <StructuredListCell>
              <FormattedDate
                date={createPipelineRunTimestamp(pipelineRun)}
                relative
              />
            </StructuredListCell>
            {pipelineRunActions && (
              <StructuredListCell>
                <RunDropdown
                  items={pipelineRunActions}
                  resource={pipelineRun}
                />
              </StructuredListCell>
            )}
          </StructuredListRow>
        );
      })}
    </StructuredListBody>
  </StructuredListWrapper>
);

export default injectIntl(PipelineRuns);
