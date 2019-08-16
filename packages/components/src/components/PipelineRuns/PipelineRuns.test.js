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
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { renderWithIntl, renderWithRouter } from '../../utils/test';
import PipelineRuns from './PipelineRuns';

it('PipelineRuns renders empty state', () => {
  const { queryByText } = renderWithIntl(<PipelineRuns pipelineRuns={[]} />);
  expect(queryByText(/no pipelineruns/i)).toBeTruthy();
  expect(queryByText(/namespace/i)).toBeFalsy();
});

it('PipelineRuns renders optional columns', () => {
  const { queryByText } = renderWithIntl(
    <PipelineRuns
      pipelineName="some-pipeline"
      pipelineRuns={[]}
      selectedNamespace={ALL_NAMESPACES}
    />
  );
  expect(queryByText(/namespace/i)).toBeTruthy();
  expect(queryByText(/pipeline/i)).toBeTruthy();
  expect(queryByText(/no pipelineruns for some-pipeline/i)).toBeTruthy();
});

it('PipelineRuns renders data', () => {
  const pipelineRunName = 'pipeline-run-20190816124708';
  const { queryByText } = renderWithRouter(
    <PipelineRuns
      pipelineRuns={[
        {
          metadata: {
            name: pipelineRunName,
            namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
            uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e'
          },
          spec: {
            pipelineRef: {
              name: 'pipeline'
            }
          },
          status: {
            conditions: [
              {
                lastTransitionTime: '2019-08-16T12:49:28Z',
                message: 'All Tasks have completed executing',
                reason: 'Succeeded',
                status: 'True',
                type: 'Succeeded'
              }
            ]
          }
        }
      ]}
    />
  );
  expect(queryByText(pipelineRunName)).toBeTruthy();
  expect(queryByText(/all tasks have completed executing/i)).toBeTruthy();
});
