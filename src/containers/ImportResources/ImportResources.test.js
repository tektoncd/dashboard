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
import { fireEvent, waitForElement } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';
import {
  renderWithIntl,
  renderWithRouter
} from '@tektoncd/dashboard-components/src/utils/test';

import ImportResourcesContainer from './ImportResources';
import * as API from '../../api';

describe('ImportResources component', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    namespaces: {
      byName: { namespace1: true, default: true },
      isFetching: false,
      selected: ALL_NAMESPACES
    },
    notifications: {},
    properties: {
      DashboardNamespace: 'namespace1'
    },
    serviceAccounts: {
      byNamespace: {
        namespace1: {
          'service-account-1': 'id-service-account-1'
        }
      },
      byId: {
        'id-service-account-1': {
          metadata: {
            name: 'service-account-1',
            namespace: 'namespace1',
            uid: 'id-service-account-1'
          }
        }
      },
      isFetching: false
    }
  });

  it('Displays errors when Repository URL and Namespace is empty', async () => {
    const { getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please enter a valid Git URL/i));
    await waitForElement(() => getByText(/Please select a namespace/i));
  });

  it('Displays an error when Repository URL is empty', async () => {
    const { getAllByPlaceholderText, getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    const namespace = 'default';

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please enter a valid Git URL/i));
  });

  it('Displays an error when Namespace is empty', async () => {
    const { getByTestId, getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'https://github.com/test/testing' }
    });

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please select a namespace/i));
  });

  it('Valid data submit displays success notification ', async () => {
    const pipelineRunName = 'fake-tekton-pipeline-run';
    const headers = {
      metadata: { name: pipelineRunName }
    };

    jest
      .spyOn(API, 'importResources')
      .mockImplementation(
        ({
          importerNamespace,
          labels,
          namespace,
          path,
          repositoryURL,
          serviceAccount
        }) => {
          const labelsShouldEqual = {
            gitOrg: 'test',
            gitRepo: 'testing',
            gitServer: 'github.com'
          };

          expect(repositoryURL).toEqual('https://github.com/test/testing');
          expect(path).toEqual('');
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
      getByTestId,
      getByText
    } = await renderWithRouter(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'https://github.com/test/testing' }
    });

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() =>
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
      getByTestId,
      getByText
    } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, { target: { value: 'URL' } });

    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText('namespace1'));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please enter a valid Git URL/i));
  });

  it('URL TextInput handles onChange event', async () => {
    const { getByTestId, queryByDisplayValue } = await renderWithIntl(
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

  it('Can clear the selected namespace', async () => {
    const {
      getAllByPlaceholderText,
      getByText,
      getAllByTitle,
      queryByText,
      queryByDisplayValue
    } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    fireEvent.click(getAllByPlaceholderText(/select namespace/i)[0]);
    fireEvent.click(getByText('default'));
    fireEvent.click(getAllByTitle(/Clear selected item/i)[0]);
    await waitForElement(() => queryByText(/please select a namespace/i));
    expect(queryByDisplayValue('default')).toBeFalsy();
  });
});
