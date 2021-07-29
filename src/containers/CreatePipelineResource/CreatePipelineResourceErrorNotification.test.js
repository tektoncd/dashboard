/*
Copyright 2020-2021 The Tekton Authors
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
import { render } from '../../utils/test';

import CreatePipelineResource from '.';
import * as API from '../../api';
import * as PipelineResourcesAPI from '../../api/pipelineResources';

it('CreatePipelineResource error notification appears', async () => {
  const errorResponseMock = {
    response: { status: 404, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'useNamespaces')
    .mockImplementation(() => ({ data: [{ metadata: { name: 'default' } }] }));
  jest
    .spyOn(PipelineResourcesAPI, 'createPipelineResource')
    .mockImplementation(() => Promise.reject(errorResponseMock));

  const { getByPlaceholderText, getByText, queryByText } = render(
    <CreatePipelineResource />
  );

  fireEvent.change(getByPlaceholderText(/pipeline-resource-name/i), {
    target: { value: 'test-pipeline-resource' }
  });
  fireEvent.click(getByPlaceholderText(/select namespace/i));
  await waitFor(() => getByText(/default/i));
  fireEvent.click(getByText(/default/i));

  fireEvent.change(getByPlaceholderText(/pipeline-resource-url/i), {
    target: { value: 'test-url' }
  });
  fireEvent.change(getByPlaceholderText(/pipeline-resource-revision/i), {
    target: { value: 'test-revision' }
  });
  fireEvent.click(queryByText('Create'));

  await waitFor(() => getByText('Error:'));
  expect(getByText('error code 404'));
});
