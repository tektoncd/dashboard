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
import { fireEvent, render, waitForElement } from 'react-testing-library';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ImportResourcesContainer from './ImportResources';
import * as API from '../../api';
import { renderWithRouter } from '../../utils/test';
import { ALL_NAMESPACES } from '../../constants';

beforeEach(jest.resetAllMocks);

describe('ImportResources component', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    namespaces: {
      byName: { namespace1: true },
      isFetching: false,
      selected: ALL_NAMESPACES
    },
    serviceAccounts: {
      byId: {},
      byNamespace: {},
      errorMessage: null,
      isFetching: false
    }
  });

  it('Valid data submit displays success notification ', async () => {
    const headers = {
      get() {
        return 'fake-tekton-pipeline-run';
      }
    };

    jest
      .spyOn(API, 'createPipelineRun')
      .mockImplementation(() => Promise.resolve(headers));

    const { getByLabelText, getByTestId, getByText } = renderWithRouter(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'https://example.com/test/testing' }
    });

    fireEvent.click(getByLabelText(/namespace/i));
    fireEvent.click(getByText(/select namespace/i));
    fireEvent.click(getByText('namespace1'));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() =>
      getByText(/Triggered PipelineRun to apply Tekton resources/i)
    );
  });

  it('Invalid data submit displays invalidText', async () => {
    const createPipelineRunResponseMock = { response: { status: 500 } };

    jest
      .spyOn(API, 'createPipelineRun')
      .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
    const { getByLabelText, getByTestId, getByText } = render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, { target: { value: 'URL' } });

    fireEvent.click(getByLabelText(/namespace/i));
    fireEvent.click(getByText(/select namespace/i));
    fireEvent.click(getByText('namespace1'));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('Failure to populate required field displays error', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('URL TextInput handles onChange event', async () => {
    const { getByTestId, queryByDisplayValue } = render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'Invalid URL here' }
    });

    await waitForElement(() => queryByDisplayValue(/Invalid URL here/i));
  });
});
