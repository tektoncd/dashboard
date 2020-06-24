/*
Copyright 2019-2020 The Tekton Authors
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

import { renderWithIntl, renderWithRouter } from '../../utils/test';
import PipelineRuns from './PipelineRuns';

describe('PipelineRuns', () => {
  it('renders empty state', () => {
    const { queryByText } = renderWithIntl(<PipelineRuns pipelineRuns={[]} />);
    expect(queryByText(/no pipelineruns/i)).toBeTruthy();
    expect(queryByText(/namespace/i)).toBeTruthy();
  });

  it('hides namespace when omitted from the list of columns', () => {
    const { queryByText } = renderWithIntl(
      <PipelineRuns
        columns={['status', 'name', 'pipeline']}
        pipelineRuns={[]}
      />
    );

    expect(queryByText(/Namespacei/)).toBeFalsy();
    expect(queryByText(/pipeline/i)).toBeTruthy();
    expect(queryByText(/no pipelineruns/i)).toBeTruthy();
  });

  it('renders custom columns', () => {
    const { queryByText } = renderWithIntl(
      <PipelineRuns
        columns={['aCustomColumn']}
        customColumns={{
          aCustomColumn: {
            header: 'Custom Column',
            getValue({ pipelineRun }) {
              return pipelineRun.metadata.someField;
            }
          }
        }}
        pipelineRuns={[
          {
            metadata: {
              name: 'pipelineRunName',
              namespace: 'default',
              someField: 'A custom value'
            },
            spec: {}
          }
        ]}
      />
    );

    expect(queryByText(/Custom Column/i)).toBeTruthy();
    expect(queryByText(/A custom value/i)).toBeTruthy();
  });

  it('renders custom column headers', () => {
    const { queryByText } = renderWithIntl(
      <PipelineRuns
        columns={['status']}
        customColumns={{
          status: {
            header: 'Custom Column Header'
          }
        }}
        pipelineRuns={[
          {
            metadata: {
              name: 'pipelineRunName',
              namespace: 'default'
            },
            spec: {}
          }
        ]}
      />
    );

    expect(queryByText(/Status/i)).toBeFalsy();
    expect(queryByText(/Custom Column Header/i)).toBeTruthy();
  });

  it('renders custom column values', () => {
    const { queryByText } = renderWithIntl(
      <PipelineRuns
        columns={['status']}
        customColumns={{
          status: {
            getValue() {
              return 'Custom Column Value';
            }
          }
        }}
        pipelineRuns={[
          {
            metadata: {
              name: 'pipelineRunName',
              namespace: 'default'
            },
            spec: {}
          }
        ]}
      />
    );

    expect(queryByText(/Status/i)).toBeTruthy();
    expect(queryByText(/Custom Column Value/i)).toBeTruthy();
  });

  it('renders data', () => {
    const pipelineRunName = 'pipeline-run-20190816124708';
    const { queryByText, queryByTitle } = renderWithRouter(
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
                  message: 'FAKE_MESSAGE',
                  reason: 'FAKE_REASON',
                  status: 'True',
                  type: 'Succeeded'
                }
              ]
            }
          }
        ]}
        pipelineRunActions={[
          {
            actionText: 'TestAction'
          }
        ]}
      />
    );
    expect(queryByText(pipelineRunName)).toBeTruthy();
    expect(queryByTitle(/FAKE_REASON/i)).toBeTruthy();
    expect(queryByTitle(/FAKE_MESSAGE/i)).toBeTruthy();
  });

  it('renders with custom link creators', () => {
    const pipelineName = 'pipeline-12345';
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
                name: pipelineName
              }
            },
            status: {
              conditions: [
                {
                  lastTransitionTime: '2019-08-16T12:49:28Z',
                  message: 'FAKE_MESSAGE',
                  reason: 'FAKE_REASON',
                  status: 'True',
                  type: 'Succeeded'
                }
              ]
            }
          }
        ]}
        pipelineRunActions={[
          {
            actionText: 'TestAction'
          }
        ]}
        createPipelineRunURL={() => null}
        createPipelineRunsByPipelineURL={() => null}
      />
    );
    expect(queryByText(pipelineRunName)).toBeTruthy();
    expect(queryByText(pipelineName)).toBeTruthy();
  });
});
