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
import {
  ALL_NAMESPACES,
  getStatus,
  getStatusIcon,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';

import { CancelButton } from '..';

import './PipelineRuns.scss';

const PipelineRuns = ({
  cancelPipelineRun,
  intl,
  pipelineName,
  pipelineRuns,
  selectedNamespace
}) => (
  <StructuredListWrapper border selection>
    <StructuredListHead>
      <StructuredListRow head>
        <StructuredListCell head>PipelineRun</StructuredListCell>
        {!pipelineName && (
          <StructuredListCell head>Pipeline</StructuredListCell>
        )}
        {selectedNamespace === ALL_NAMESPACES && (
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
        <StructuredListCell head />
      </StructuredListRow>
    </StructuredListHead>
    <StructuredListBody>
      {!pipelineRuns.length && (
        <StructuredListRow>
          <StructuredListCell>
            {pipelineName ? (
              <span>No PipelineRuns for {pipelineName}</span>
            ) : (
              <span>No PipelineRuns</span>
            )}
          </StructuredListCell>
        </StructuredListRow>
      )}
      {pipelineRuns.map(pipelineRun => {
        const { name: pipelineRunName, namespace } = pipelineRun.metadata;
        const pipelineRefName = pipelineRun.spec.pipelineRef.name;
        const { lastTransitionTime, reason, status } = getStatus(pipelineRun);

        return (
          <StructuredListRow
            className="definition"
            key={pipelineRun.metadata.uid}
          >
            <StructuredListCell>
              <Link
                to={urls.pipelineRuns.byName({
                  namespace,
                  pipelineName: pipelineRefName,
                  pipelineRunName
                })}
              >
                {pipelineRunName}
              </Link>
            </StructuredListCell>
            {!pipelineName && (
              <StructuredListCell>
                <Link
                  to={urls.pipelineRuns.byPipeline({
                    namespace,
                    pipelineName: pipelineRefName
                  })}
                >
                  {pipelineRefName}
                </Link>
              </StructuredListCell>
            )}
            {selectedNamespace === ALL_NAMESPACES && (
              <StructuredListCell>{namespace}</StructuredListCell>
            )}
            <StructuredListCell
              className="status"
              data-reason={reason}
              data-status={status}
            >
              {getStatusIcon({ reason, status })}
              {pipelineRun.status.conditions
                ? pipelineRun.status.conditions[0].message
                : ''}
            </StructuredListCell>
            <StructuredListCell>{lastTransitionTime}</StructuredListCell>
            <StructuredListCell>
              {isRunning(reason, status) && (
                <CancelButton
                  type="PipelineRun"
                  name={pipelineRunName}
                  onCancel={() =>
                    cancelPipelineRun({
                      name: pipelineRunName,
                      namespace
                    })
                  }
                />
              )}
            </StructuredListCell>
          </StructuredListRow>
        );
      })}
    </StructuredListBody>
  </StructuredListWrapper>
);

export default injectIntl(PipelineRuns);
