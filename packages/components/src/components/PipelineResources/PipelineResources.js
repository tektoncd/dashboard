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
import { urls } from '@tektoncd/dashboard-utils';

import { RunDropdown } from '..';

const PipelineResources = ({
  createPipelineResourcesURL = urls.pipelineResources.byName,
  createPipelineResourceDisplayName = ({ pipelineResourceMetadata }) =>
    pipelineResourceMetadata.name,
  pipelineResourceActions,
  pipelineResources
}) => (
  <StructuredListWrapper border selection>
    <StructuredListHead>
      <StructuredListRow head>
        <StructuredListCell head>PipelineResource</StructuredListCell>
        <StructuredListCell head>Namespace</StructuredListCell>
        <StructuredListCell head>Type</StructuredListCell>
        {pipelineResourceActions && <StructuredListCell head />}
      </StructuredListRow>
    </StructuredListHead>
    <StructuredListBody>
      {!pipelineResources.length && (
        <StructuredListRow>
          <StructuredListCell>
            <span>No PipelineResources</span>
          </StructuredListCell>
        </StructuredListRow>
      )}
      {pipelineResources.map((pipelineResource, index) => {
        const { namespace } = pipelineResource.metadata;
        const pipelineResourceName = createPipelineResourceDisplayName({
          pipelineResourceMetadata: pipelineResource.metadata
        });
        const url = createPipelineResourcesURL({
          namespace,
          pipelineResourceName
        });

        return (
          <StructuredListRow
            className="definition"
            key={pipelineResource.metadata.uid || index}
          >
            <StructuredListCell>
              {url ? (
                <Link to={url}>{pipelineResourceName}</Link>
              ) : (
                pipelineResourceName
              )}
            </StructuredListCell>
            <StructuredListCell>{namespace}</StructuredListCell>
            <StructuredListCell>
              {pipelineResource.spec.type}
            </StructuredListCell>
            {pipelineResourceActions && (
              <StructuredListCell>
                <RunDropdown
                  items={pipelineResourceActions}
                  resource={pipelineResource}
                />
              </StructuredListCell>
            )}
          </StructuredListRow>
        );
      })}
    </StructuredListBody>
  </StructuredListWrapper>
);

export default injectIntl(PipelineResources);
