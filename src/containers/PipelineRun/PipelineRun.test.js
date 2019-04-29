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
import { waitForElement } from 'react-testing-library';

import { PipelineRunContainer } from './PipelineRun';
import * as API from '../../api';
import { renderWithRouter } from '../../utils/test';

beforeEach(jest.resetAllMocks);

it('PipelineRunContainer renders', async () => {
  const pipelineRunName = 'bar';
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName
    }
  };
  const getPipelineRun = jest
    .spyOn(API, 'getPipelineRun')
    .mockImplementation(() => '');
  const getTasks = jest.spyOn(API, 'getTasks').mockImplementation(() => '');
  const { getByText } = renderWithRouter(
    <PipelineRunContainer match={match} />
  );
  await waitForElement(() => getByText(pipelineRunName));
  expect(getPipelineRun).toHaveBeenCalledTimes(1);
  expect(getTasks).toHaveBeenCalledTimes(1);
});

it('PipelineRunContainer handles error state', async () => {
  const match = {
    params: {
      pipelineName: 'foo',
      pipelineRunName: 'bar'
    }
  };
  const getPipelineRun = jest
    .spyOn(API, 'getPipelineRun')
    .mockImplementation(() => {
      const error = new Error();
      error.response = {
        status: 504
      };
      throw error;
    });
  const { getByText } = renderWithRouter(
    <PipelineRunContainer match={match} />
  );
  await waitForElement(() => getByText('Error'));
  expect(getPipelineRun).toHaveBeenCalledTimes(1);
});
