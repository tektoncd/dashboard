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
import { fireEvent, waitForElement } from 'react-testing-library';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { renderWithIntl, renderWithRouter } from '../../utils/test';
import ImportResourcesContainer from './ImportResources';
import * as API from '../../api';
import 'jest-dom/extend-expect';

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
    await waitForElement(() => getByText(/Please submit a valid URL/i));
    await waitForElement(() => getByText(/Please select a namespace/i));
  });

  it('Displays an error when Repository URL is empty', async () => {
    const { getByPlaceholderText, getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    const namespace = 'default';

    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('Displays an error when Namepsace is empty', async () => {
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

  it('Displays an error when Repository URL starts with the incorrect term', async () => {
    const { getByTestId, getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'incorrecthttps://github.com/test/testing' }
    });

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please select a namespace/i));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('Displays an error when Repository URL doesnt contain github', async () => {
    const { getByTestId, getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'https://cat.com/test/testing' }
    });

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please select a namespace/i));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('Displays an error when Repository URL doesnt contain a .', async () => {
    const { getByTestId, getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, {
      target: { value: 'https://cat-com/test/testing' }
    });

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please select a namespace/i));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
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
          repositoryURL,
          applyDirectory,
          namespace,
          labels,
          serviceAccount,
          importerNamespace
        }) => {
          const labelsShouldEqual = {
            gitOrg: 'test',
            gitRepo: 'testing.git',
            gitServer: 'github.com'
          };

          expect(repositoryURL).toEqual('https://github.com/test/testing');
          expect(applyDirectory).toEqual('');
          expect(namespace).toEqual('default');
          expect(labels).toEqual(labelsShouldEqual);
          expect(serviceAccount).toEqual('');
          expect(importerNamespace).toEqual('namespace1');

          return Promise.resolve(headers);
        }
      );

    const namespace = 'default';

    const {
      getByPlaceholderText,
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

    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(namespace));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() =>
      getByText(/Triggered PipelineRun to apply Tekton resources/i)
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
      getByPlaceholderText,
      getByTestId,
      getByText
    } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    const repoURLField = getByTestId('repository-url-field');
    fireEvent.change(repoURLField, { target: { value: 'URL' } });

    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText('namespace1'));

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('Failure to populate required field displays error', async () => {
    const { getByText } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
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
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByText,
      queryByValue
    } = await renderWithIntl(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(getByText(/default/i));
    fireEvent.click(getByTitle(/Clear selected item/i));
    await waitForElement(() => queryByText(/please select a namespace/i));
    expect(queryByValue('default')).toBeFalsy();
  });
});
