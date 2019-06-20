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
import { fireEvent, render, wait, waitForElement } from 'react-testing-library';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreatePipelineRun from './CreatePipelineRun';
import * as API from '../../api';
import { ALL_NAMESPACES } from '../../constants';

const invalidK8sName = 'invalidName';
const invalidK8sNameRegExp = /must consist of only lower case alphanumeric characters, -, and . with at most 253 characters/i;
const invalidNoSpacesName = 'invalid name';
const invalidNoSpacesNameRegExp = /must contain no spaces/i;

const allNamespacesTestStore = {
  namespaces: {
    selected: ALL_NAMESPACES,
    byName: {
      default: ''
    },
    isFetching: false
  }
};
const defaultNamespacesTestStore = {
  namespaces: {
    selected: 'default',
    byName: {
      default: ''
    },
    isFetching: false
  }
};
const pipelinesTestStore = {
  pipelines: {
    byNamespace: {
      default: {
        'pipeline-1': 'id-pipeline-1'
      }
    },
    byId: {
      'id-pipeline-1': {
        metadata: {
          name: 'pipeline-1',
          namespace: 'default',
          uid: 'id-pipeline-1'
        }
      }
    },
    isFetching: false
  }
};
const serviceAccountsTestStore = {
  serviceAccounts: {
    byNamespace: {
      default: {
        'service-account-1': 'id-service-account-1'
      }
    },
    byId: {
      'id-service-account-1': {
        metadata: {
          name: 'service-account-1',
          namespace: 'default',
          uid: 'id-service-account-1'
        }
      }
    },
    isFetching: false
  }
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStoreAllNamespaces = mockStore({
  ...allNamespacesTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore,
  pipelineRuns: {
    errorMessage: '',
    isFetching: false,
    byId: {},
    byNamespace: {}
  }
});
const testStoreDefaultNamespace = mockStore({
  ...defaultNamespacesTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore,
  pipelineRuns: {
    errorMessage: '',
    isFetching: false,
    byId: {},
    byNamespace: {}
  }
});

beforeEach(() => {
  jest.resetAllMocks();
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccountsTestStore.serviceAccounts.byId);
  jest
    .spyOn(API, 'getPipelines')
    .mockImplementation(() => pipelinesTestStore.pipelines.byId);
  jest.spyOn(API, 'getPipelineRuns').mockImplementation(() => {});
});

const fillNamespace = getByText => {
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/default/i));
};

const fillPipeline = getByText => {
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
};

const fillServiceAccount = getByText => {
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
};

const fillRequiredFields = getByText => {
  fillNamespace(getByText);
  fillPipeline(getByText);
  fillServiceAccount(getByText);
};

const testValidateTextInputField = (
  placeholderTextRegExp,
  textValue,
  invalidTextRegExp
) => {
  const { getByText, getByPlaceholderText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillRequiredFields(getByText);
  // Set invalid text input
  fireEvent.change(getByPlaceholderText(placeholderTextRegExp), {
    target: { value: textValue }
  });
  expect(queryByText(invalidTextRegExp)).toBeTruthy();
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  // Set back to valid
  fireEvent.change(getByPlaceholderText(placeholderTextRegExp), {
    target: { value: '' }
  });
  expect(queryByText(invalidTextRegExp)).toBeFalsy();
};

it('CreatePipelineRun renders', () => {
  const { queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  expect(queryByText(/create pipelinerun/i)).toBeTruthy();
});

it('CreatePipelineRun renders controlled pipeline selection', () => {
  const { queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open pipelineName="pipeline-1" namespace="default" />
    </Provider>
  );
  expect(queryByText(/create pipelinerun/i)).toBeTruthy();
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  expect(queryByText(/default/i)).toBeTruthy();
});

it('CreatePipelineRun renders namespace dropdown for selected namespace', () => {
  const { queryByText } = render(
    <Provider store={testStoreDefaultNamespace}>
      <CreatePipelineRun open />
    </Provider>
  );
  expect(queryByText(/default/i)).toBeTruthy();
});

it('CreatePipelineRun resets pipeline and service account when namespace changes', () => {
  const { getByText, getAllByText } = render(
    <Provider store={testStoreDefaultNamespace}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillPipeline(getByText);
  fillServiceAccount(getByText);
  expect(getByText(/pipeline-1/i));
  expect(getByText(/service-account-1/i));
  fireEvent.click(getByText(/default/i));
  fireEvent.click(getAllByText(/default/i)[1]);
  expect(getByText(/pipeline-1/i));
  expect(getByText(/service-account-1/i));
});

it('CreatePipelineRun validates form namespace', () => {
  const { getByText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillServiceAccount(getByText);
  fillPipeline(getByText);
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/namespace cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form pipeline', () => {
  const { getByText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillNamespace(getByText);
  fillServiceAccount(getByText);
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/pipeline cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form service account', () => {
  const { getByText, queryByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillNamespace(getByText);
  fillPipeline(getByText);
  fireEvent.click(getByText(/submit/i));
  expect(queryByText(/unable to submit/i)).toBeTruthy();
  expect(queryByText(/service account cannot be empty/i)).toBeTruthy();
});

it('CreatePipelineRun validates form git resource name', () => {
  testValidateTextInputField(
    /git-source/i,
    invalidK8sName,
    invalidK8sNameRegExp
  );
});

it('CreatePipelineRun validates form git repo url', () => {
  testValidateTextInputField(
    /https:\/\/github.com\/user\/project/i,
    'I am not a URL',
    /must be a valid url/i
  );
});

it('CreatePipelineRun validates form git revision', () => {
  testValidateTextInputField(
    /master/i,
    invalidNoSpacesName,
    invalidNoSpacesNameRegExp
  );
});

it('CreatePipelineRun validates form image name', () => {
  testValidateTextInputField(
    /docker-image/i,
    invalidK8sName,
    invalidK8sNameRegExp
  );
});

it('CreatePipelineRun validates form image registry', () => {
  testValidateTextInputField(
    /registryname/i,
    invalidNoSpacesName,
    invalidNoSpacesNameRegExp
  );
});

it('CreatePipelineRun validates form image repo', () => {
  testValidateTextInputField(
    /reponame/i,
    invalidNoSpacesName,
    invalidNoSpacesNameRegExp
  );
});

it('CreatePipelineRun validates form helm secret', () => {
  testValidateTextInputField(
    /helm-secret/i,
    invalidK8sName,
    invalidK8sNameRegExp
  );
});

it('CreatePipelineRun submits form', async () => {
  const formValues = {
    gitcommit: '',
    gitresourcename: '',
    helmsecret: '',
    imageresourcename: '',
    pipelinename: 'pipeline-1',
    pipelineruntype: 'helm',
    registrylocation: '',
    reponame: '',
    repourl: '',
    serviceaccount: 'service-account-1'
  };
  const { getByText, getByTestId } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  fillRequiredFields(getByText);
  // Set Helm Pipeline
  fireEvent.click(getByTestId('helm-pipeline-toggle'));
  // Submit
  const createPipelineRun = jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() =>
      Promise.resolve({
        get: () => {
          return '/v1/namespaces/default/pipelineruns//tekton-pipeline-run';
        }
      })
    );
  fireEvent.click(getByText(/submit/i));
  await wait(() => expect(createPipelineRun).toHaveBeenCalledTimes(1));
  await wait(() =>
    expect(createPipelineRun).toHaveBeenCalledWith({
      namespace: 'default',
      payload: formValues
    })
  );
});

it('CreatePipelineRun handles error state', async () => {
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 400, text: () => Promise.resolve('test error message') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/test error message/i));
});

it('CreatePipelineRun handles error state 400', async () => {
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 400, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/bad request/i));
});

it('CreatePipelineRun handles error state 412', async () => {
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 412, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/pipeline not found/i));
});

it('CreatePipelineRun handles error state abnormal code', async () => {
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);
  // Submit create request
  const createPipelineRunResponseMock = {
    response: { status: 0, text: () => Promise.resolve('') }
  };
  jest
    .spyOn(API, 'createPipelineRun')
    .mockImplementation(() => Promise.reject(createPipelineRunResponseMock));
  fireEvent.click(getByText(/submit/i));
  await waitForElement(() => getByText(/error creating pipelinerun/i));
  await waitForElement(() => getByText(/error code 0/i));
});

it('CreatePipelineRun handles onSuccess event', async () => {
  const onSuccess = jest.fn();
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open onSuccess={onSuccess} />
    </Provider>
  );
  // Fill required fields
  fillRequiredFields(getByText);

  // Submit create request
  jest.spyOn(API, 'createPipelineRun').mockImplementation(() =>
    Promise.resolve({
      get: () => {
        return '/v1/namespaces/default/pipelineruns//tekton-pipeline-run';
      }
    })
  );
  fireEvent.click(getByText(/submit/i));
  await wait(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});

it('CreatePipelineRun handles onClose event', () => {
  const onClose = jest.fn();
  const { getByText } = render(
    <Provider store={testStoreAllNamespaces}>
      <CreatePipelineRun open onClose={onClose} />
    </Provider>
  );
  fireEvent.click(getByText(/cancel/i));
  expect(onClose).toHaveBeenCalledTimes(1);
});
