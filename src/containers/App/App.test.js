/*
Copyright 2019-2022 The Tekton Authors
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

import { App } from './App';
import { render } from '../../utils/test';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';

describe('App', () => {
  beforeEach(() => {
    jest
      .spyOn(PipelinesAPI, 'usePipelines')
      .mockImplementation(() => ({ data: [] }));
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
    jest.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => false);
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => undefined);
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  });

  it('renders successfully in full cluster mode', async () => {
    const { queryAllByText, queryByText } = render(<App lang="en" />);

    await waitFor(() => queryByText('Tekton resources'));
    fireEvent.click(queryAllByText('PipelineRuns')[0]);

    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('renders successfully in single namespace mode', async () => {
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const { queryAllByText, queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));
    fireEvent.click(queryAllByText('PipelineRuns')[0]);

    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('does not call namespaces API in single namespace mode', async () => {
    jest.spyOn(API, 'getNamespaces');
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const { queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));
    expect(API.useNamespaces).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls namespaces API in full cluster mode', async () => {
    jest.spyOn(API, 'getNamespaces');
    const { queryByText } = render(<App />);

    await waitFor(() => queryByText('Tekton resources'));
    await waitFor(() =>
      expect(API.useNamespaces).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      )
    );
  });
});
