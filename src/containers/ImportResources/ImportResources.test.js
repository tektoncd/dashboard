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
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import ImportResourcesContainer from './ImportResources';
import * as API from '../../api';
import 'jest-dom/extend-expect';

beforeEach(jest.resetAllMocks);

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

  it('Valid data submit displays success notification ', async () => {
    const installNamespace = 'namespace1';
    const namespace = 'default';
    const pipelineRunName = 'fake-tekton-pipeline-run';
    const headers = {
      metadata: { name: pipelineRunName }
    };

    jest
      .spyOn(API, 'createPipelineResource')
      .mockImplementation(() =>
        Promise.resolve({ metadata: { name: 'git-source' } })
      );

    jest.spyOn(API, 'createPipelineRun').mockImplementation(pipelineRun => {
      const paramShouldEqual = {
        pipelineName: 'pipeline0',
        serviceAccount: '',
        resources: { 'git-source': 'git-source' },
        params: { 'apply-directory': '', 'target-namespace': 'default' },
        namespace: 'namespace1',
        labels: {
          gitServer: 'example.com',
          gitOrg: 'test',
          gitRepo: 'testing.git'
        }
      };
      // If the test on the line below fails, there is no clear error given.
      // The test outputs the webpage and you see a "Please submit a valid URl".
      // This essentially tells you that something has gone wrong in the
      // creation of the pipelinerun .... which could well be that the
      // expected parameter values no longer match.  Adding a
      // console log of pipelineRun here will allow you to check what was given
      // to createPipelineRun.
      expect(pipelineRun).toEqual(paramShouldEqual);
      return Promise.resolve(headers);
    });

    jest
      .spyOn(API, 'determineInstallNamespace')
      .mockImplementation(() => installNamespace);

    const { getByLabelText, getByTestId, getByText } = await renderWithRouter(
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
        namespace: installNamespace,
        pipelineRunName
      })
    );
  });

  it('Invalid data submit displays invalidText', async () => {
    const createPipelineRunResponseMock = { response: { status: 500 } };

    jest
      .spyOn(API, 'createPipelineResource')
      .mockImplementation(() =>
        Promise.resolve({ metadata: { name: 'git-source' } })
      );

    jest
      .spyOn(API, 'createPipelineRun')
      .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));

    jest
      .spyOn(API, 'determineInstallNamespace')
      .mockImplementation(() => 'namespace1');

    const { getByLabelText, getByTestId, getByText } = await render(
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
    jest
      .spyOn(API, 'determineInstallNamespace')
      .mockImplementation(() => 'namespace1');

    const { getByText } = await render(
      <Provider store={store}>
        <ImportResourcesContainer />
      </Provider>
    );

    fireEvent.click(getByText('Import and Apply'));
    await waitForElement(() => getByText(/Please submit a valid URL/i));
  });

  it('URL TextInput handles onChange event', async () => {
    jest
      .spyOn(API, 'determineInstallNamespace')
      .mockImplementation(() => 'namespace1');

    const { getByTestId, queryByDisplayValue } = await render(
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
