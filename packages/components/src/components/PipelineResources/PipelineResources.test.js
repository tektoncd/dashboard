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
import { fireEvent, waitFor } from '@testing-library/react';
import { TrashCan32 as Delete } from '@carbon/icons-react';
import { render, renderWithRouter } from '../../utils/test';
import PipelineResources from './PipelineResources';

it('PipelineResources renders empty state', () => {
  const { queryByText } = render(<PipelineResources pipelineResources={[]} />);
  expect(queryByText(/no matching pipelineresources/i)).toBeTruthy();
  expect(queryByText('Namespace')).toBeTruthy();
});

it('PipelineResources renders headers state', () => {
  const { queryByText } = render(<PipelineResources pipelineResources={[]} />);
  expect(queryByText(/pipelineresources/i)).toBeTruthy();
  expect(queryByText('Namespace')).toBeTruthy();
  expect(queryByText(/type/i)).toBeTruthy();
  expect(document.getElementsByClassName('bx--overflow-menu')).toBeTruthy();
});

it('PipelineResources renders correct data', async () => {
  const pipelineResourceName = 'pipeline-resource-20190816124708';
  const batchDeleteSpy = jest.fn();
  const { queryByText, getByLabelText, getByText } = renderWithRouter(
    <PipelineResources
      pipelineResources={[
        {
          metadata: {
            name: pipelineResourceName,
            namespace: 'default-namespace',
            type: 'git',
            uid: '15269df7-0b1e-4a04-a9ea-f47f7da20fa4'
          },
          spec: {
            params: [
              {
                name: 'url',
                value: 'https://github.com/pipeline-hotel/example-pipelines'
              },
              {
                name: 'revision',
                value: 'master'
              }
            ],
            type: 'git'
          }
        }
      ]}
      batchActionButtons={[
        {
          onClick: batchDeleteSpy,
          text: 'Delete',
          icon: Delete
        }
      ]}
    />
  );
  expect(queryByText(pipelineResourceName)).toBeTruthy();
  expect(queryByText(/default-namespace/i)).toBeTruthy();
  expect(queryByText(/git/i)).toBeTruthy();
  fireEvent.click(await waitFor(() => getByLabelText(/select row/i)));
  await waitFor(() => getByText(/Delete/i));
  expect(getByText(/1 item selected/i)).toBeTruthy();
});
