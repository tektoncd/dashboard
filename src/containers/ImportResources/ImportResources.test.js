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
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { render, renderWithRouter } from '../../utils/test';
import ImportResourcesContainer from './ImportResources';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';

describe('ImportResources component', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    notifications: {}
  });

  beforeEach(() => {
    jest
      .spyOn(API, 'useDashboardNamespace')
      .mockImplementation(() => 'namespace1');
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['namespace1', 'default'] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
  });

  it('Displays errors when Repository URL and Namespace is empty', async () => {
    const { getByText } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please enter a valid Git URL/i));
    await waitFor(() => getByText(/Please select a Namespace/i));
  });

  it('Displays an error when Repository URL is empty', async () => {
    const { getAllByPlaceholderText, getByText } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    const namespace = 'default';

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please enter a valid Git URL/i));
  });

  it('Displays an error when Namespace is empty', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, {
      target: { value: 'https://github.com/test/testing' }
    });

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please select a Namespace/i));
  });

  it('Valid data submit displays success notification ', async () => {
    const pipelineRunName = 'fake-tekton-pipeline-run';
    const headers = {
      metadata: { name: pipelineRunName }
    };

    const pathValue = 'some/path';
    const repositoryURLValue = 'https://github.com/test/testing';
    const revisionValue = 'main';

    jest
      .spyOn(API, 'importResources')
      .mockImplementation(
        ({
          importerNamespace,
          labels,
          namespace,
          path,
          repositoryURL,
          revision,
          serviceAccount
        }) => {
          const labelsShouldEqual = {
            gitOrg: 'test',
            gitRepo: 'testing',
            gitServer: 'github.com'
          };

          expect(repositoryURL).toEqual(repositoryURLValue);
          expect(path).toEqual(pathValue);
          expect(revision).toEqual(revisionValue);
          expect(namespace).toEqual('default');
          expect(labels).toEqual(labelsShouldEqual);
          expect(serviceAccount).toEqual('');
          expect(importerNamespace).toEqual('namespace1');

          return Promise.resolve(headers);
        }
      );

    const namespace = 'default';

    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getByText
    } = await renderWithRouter(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, { target: { value: repositoryURLValue } });

    const pathField = getByPlaceholderText(/enter repository path/i);
    fireEvent.change(pathField, { target: { value: pathValue } });

    const revisionField = getByPlaceholderText(/revision/i);
    fireEvent.change(revisionField, { target: { value: revisionValue } });

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import'));
    await waitFor(() =>
      getByText(/Triggered PipelineRun to import Tekton resources/i)
    );

    expect(
      document.getElementsByClassName('bx--toast-notification__caption')[0]
        .innerHTML
    ).toContain(
      urls.pipelineRuns.byName({
        namespace: 'namespace1',
        pipelineRunName
      })
    );
  });

  it('Invalid data submit displays invalidText', async () => {
    const importResourcesResponseMock = { response: { status: 500 } };

    jest
      .spyOn(API, 'importResources')
      .mockImplementation(() => Promise.reject(importResourcesResponseMock));

    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getByText
    } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, { target: { value: 'URL' } });

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText('namespace1'));

    fireEvent.click(getByText('Import'));
    await waitFor(() => getByText(/Please enter a valid Git URL/i));
  });

  it('URL TextInput handles onChange event', async () => {
    const { getByPlaceholderText, queryByDisplayValue } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    const repoURLField = getByPlaceholderText(/my-repository/);
    fireEvent.change(repoURLField, {
      target: { value: 'Invalid URL here' }
    });

    await waitFor(() => queryByDisplayValue(/Invalid URL here/i));
  });

  it('Can clear the selected namespace', async () => {
    const {
      getAllByPlaceholderText,
      getByText,
      getAllByTitle,
      queryByText,
      queryByDisplayValue
    } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText('default'));
    fireEvent.click(getAllByTitle(/Clear selected item/i)[0]);
    await waitFor(() => queryByText(/please select a Namespace/i));
    expect(queryByDisplayValue('default')).toBeFalsy();
  });
});
