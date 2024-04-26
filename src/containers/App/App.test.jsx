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

import { fireEvent, waitFor } from '@testing-library/react';

import { App } from './App';
import { render } from '../../utils/test';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(API, 'useProperties').mockImplementation(() => ({ data: {} }));
    vi.spyOn(PipelinesAPI, 'usePipelines').mockImplementation(() => ({
      data: []
    }));
    vi.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
    vi.spyOn(API, 'useIsTriggersInstalled').mockImplementation(() => false);
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({ data: [] }));
  });

  it('renders successfully in full cluster mode', async () => {
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => []);
    const { findAllByText, queryAllByText, queryByText } = render(
      <App lang="en" />
    );

    await waitFor(() => queryByText('Tekton resources'));
    await findAllByText('PipelineRuns');
    fireEvent.click(queryAllByText('PipelineRuns')[0]);

    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('renders successfully in tenant namespace mode', async () => {
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => ['fake']);
    const { findAllByText, queryAllByText, queryByText } = render(
      <App lang="en" />
    );

    await waitFor(() => queryByText('Tekton resources'));
    await findAllByText('PipelineRuns');
    fireEvent.click(queryAllByText('PipelineRuns')[0]);

    expect(queryByText('Pipelines')).toBeTruthy();
    expect(queryByText('Tasks')).toBeTruthy();
  });

  it('does not call namespaces API in tenant namespace mode', async () => {
    vi.spyOn(API, 'getNamespaces');
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => ['fake']);
    const { queryByText } = render(<App lang="en" />);

    await waitFor(() => queryByText('Tekton resources'));
    expect(API.useNamespaces).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls namespaces API in full cluster mode', async () => {
    vi.spyOn(API, 'getNamespaces').mockImplementation(() => {});
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => []);
    const { queryByText } = render(<App lang="en" />);

    await waitFor(() => queryByText('Tekton resources'));
    await waitFor(() =>
      expect(API.useNamespaces).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      )
    );
  });
});
