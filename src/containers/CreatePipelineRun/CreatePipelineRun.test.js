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
import {
  cleanup,
  fireEvent,
  render,
  wait,
  waitForElement
} from 'react-testing-library';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CreatePipelineRun from './CreatePipelineRun';
import * as API from '../../api';
import * as store from '../../store';
import * as reducers from '../../reducers';
import { ALL_NAMESPACES } from '../../constants';

const namespacesTestStore = {
  namespaces: {
    selected: 'namespace-1',
    byName: {
      'namespace-1': '',
      'namespace-2': ''
    },
    isFetching: false
  }
};
const pipelinesTestStore = {
  pipelines: {
    byNamespace: {
      'namespace-1': {
        'pipeline-1': 'id-pipeline-1',
        'pipeline-2': 'id-pipeline-2'
      },
      'namespace-2': {
        'pipeline-3': 'id-pipeline-3'
      }
    },
    byId: {
      'id-pipeline-1': {
        metadata: {
          name: 'pipeline-1',
          namespace: 'namespace-1',
          uid: 'id-pipeline-1'
        },
        spec: {
          resources: [
            { name: 'resource-1', type: 'type-1' },
            { name: 'resource-2', type: 'type-2' }
          ],
          params: [
            {
              name: 'param-1',
              description: 'description-1',
              default: 'default-1'
            },
            { name: 'param-2' }
          ]
        }
      },
      'id-pipeline-2': {
        metadata: {
          name: 'pipeline-2',
          namespace: 'namespace-1',
          uid: 'id-pipeline-2'
        },
        spec: {}
      },
      'id-pipeline-3': {
        metadata: {
          name: 'pipeline-3',
          namespace: 'namespace-2',
          uid: 'id-pipeline-3'
        },
        spec: {}
      }
    },
    isFetching: false
  }
};
const serviceAccountsTestStore = {
  serviceAccounts: {
    byNamespace: {
      'namespace-1': {
        'service-account-1': 'id-service-account-1'
      },
      'namespace-2': {
        'service-account-2': 'id-service-account-2'
      }
    },
    byId: {
      'id-service-account-1': {
        metadata: {
          name: 'service-account-1',
          namespace: 'namespace-1',
          uid: 'id-service-account-1'
        }
      },
      'id-service-account-2': {
        metadata: {
          name: 'service-account-2',
          namespace: 'namespace-2',
          uid: 'id-service-account-2'
        }
      }
    },
    isFetching: false
  }
};
const pipelineResourcesTestStore = {
  pipelineResources: {
    byNamespace: {
      'namespace-1': {
        'pipeline-resource-1': 'id-pipeline-resource-1',
        'pipeline-resource-2': 'id-pipeline-resource-2'
      }
    },
    byId: {
      'id-pipeline-resource-1': {
        metadata: { name: 'pipeline-resource-1' },
        spec: { type: 'type-1' }
      },
      'id-pipeline-resource-2': {
        metadata: { name: 'pipeline-resource-2' },
        spec: { type: 'type-2' }
      }
    },
    isFetching: false
  }
};
const pipelineRunsTestStore = {
  pipelineRuns: {
    isFetching: false,
    byId: {},
    byNamespace: {}
  }
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore,
  ...pipelineResourcesTestStore,
  ...pipelineRunsTestStore
};

afterEach(cleanup);
beforeEach(() => {
  jest.resetAllMocks();
  jest
    .spyOn(API, 'getServiceAccounts')
    .mockImplementation(() => serviceAccountsTestStore.serviceAccounts.byId);
  jest
    .spyOn(API, 'getPipelines')
    .mockImplementation(() => pipelinesTestStore.pipelines.byId);
  jest
    .spyOn(API, 'getPipelineResources')
    .mockImplementation(
      () => pipelineResourcesTestStore.pipelineResources.byId
    );
  jest
    .spyOn(API, 'getPipelineRuns')
    .mockImplementation(() => pipelineRunsTestStore.pipelineRuns.byId);
});

const props = {
  open: true,
  namespace: 'namespace-1'
};

const validationErrorMsgRegExp = /please fix the fields with errors, then resubmit/i;
const namespaceValidationErrorRegExp = /namespace cannot be empty/i;
const pipelineValidationErrorRegExp = /pipeline cannot be empty/i;
const pipelineResourceValidationErrorRegExp = /pipelineresources cannot be empty/i;
const paramsValidationErrorRegExp = /params cannot be empty/i;
const apiErrorRegExp = /error creating pipelinerun/i;

const submitButton = allByText => {
  return allByText(/create pipelinerun/i)[1];
};

const testPipelineSpec = (pipelineId, queryByText, queryByValue) => {
  // Verify proper param and resource fields are displayed
  const pipeline = pipelinesTestStore.pipelines.byId[pipelineId];
  const paramsRegExp = /params/i;
  const resourcesRegExp = /resources/i;
  if (pipeline.spec.params) {
    expect(queryByText(paramsRegExp)).toBeTruthy();
    pipeline.spec.params.forEach(param => {
      expect(queryByText(new RegExp(param.name, 'i'))).toBeTruthy();
      if (param.description) {
        expect(queryByText(new RegExp(param.description, 'i'))).toBeTruthy();
      }
      if (param.default) {
        expect(queryByValue(new RegExp(param.default, 'i'))).toBeTruthy();
      }
    });
  } else {
    expect(queryByText(paramsRegExp)).toBeFalsy();
  }
  if (pipeline.spec.resources) {
    expect(queryByText(resourcesRegExp)).toBeTruthy();
    pipeline.spec.resources.forEach(resource => {
      expect(queryByText(new RegExp(resource.name, 'i'))).toBeTruthy();
      expect(queryByText(new RegExp(resource.type, 'i'))).toBeTruthy();
    });
  } else {
    expect(queryByText(resourcesRegExp)).toBeFalsy();
  }
};

const selectPipeline1 = getByText => {
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
  expect(getByText(/pipeline-1/i)).toBeTruthy();
};

const fillPipeline1Resources = getByText => {
  fireEvent.click(getByText(/select pipelineresource/i));
  fireEvent.click(getByText(/pipeline-resource-1/i));
  fireEvent.click(getByText(/select pipelineresource/i));
  fireEvent.click(getByText(/pipeline-resource-2/i));
};

const fillPipeline1Params = getByPlaceholderText => {
  fireEvent.change(getByPlaceholderText(/default-1/i), {
    target: { value: 'value-1' }
  });
  fireEvent.change(getByPlaceholderText(/param-2/i), {
    target: { value: 'value-2' }
  });
};

const selectPipeline1AndFillSpec = (
  getByText,
  getByPlaceholderText,
  queryByText,
  queryByValue
) => {
  // Select pipeline-1 and verify spec details are displayed
  selectPipeline1(getByText);
  testPipelineSpec('id-pipeline-1', queryByText, queryByValue);
  // Fill pipeline spec
  fillPipeline1Resources(getByText);
  fillPipeline1Params(getByPlaceholderText);
};

it('CreatePipelineRun handles api error', async () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const {
    getByText,
    getAllByText,
    getByPlaceholderText,
    queryByText,
    queryByValue
  } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  selectPipeline1AndFillSpec(
    getByText,
    getByPlaceholderText,
    queryByText,
    queryByValue
  );
  // Submit
  const errorResponseMock = {
    response: { status: 400, text: () => Promise.resolve('') }
  };
  const createPipelineRun = jest
    .spyOn(API, 'createPipelineRunAtProxy')
    .mockImplementation(() => Promise.reject(errorResponseMock));
  fireEvent.click(submitButton(getAllByText));
  await wait(() => expect(createPipelineRun).toHaveBeenCalledTimes(1));
  await waitForElement(() => getByText(apiErrorRegExp));
  await waitForElement(() => getByText(/error code 400/i));
});

it('CreatePipelineRun handles api error with text', async () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const {
    getByText,
    getAllByText,
    getByPlaceholderText,
    queryByText,
    queryByValue
  } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  selectPipeline1AndFillSpec(
    getByText,
    getByPlaceholderText,
    queryByText,
    queryByValue
  );
  // Submit
  const errorResponseMock = {
    response: { status: 401, text: () => Promise.resolve('example message') }
  };
  const createPipelineRun = jest
    .spyOn(API, 'createPipelineRunAtProxy')
    .mockImplementation(() => Promise.reject(errorResponseMock));
  fireEvent.click(submitButton(getAllByText));
  await wait(() => expect(createPipelineRun).toHaveBeenCalledTimes(1));
  await waitForElement(() => getByText(apiErrorRegExp));
  await waitForElement(() => getByText(/example message \(error code 401\)/i));
});

it('CreatePipelineRun renders empty', () => {
  const { queryByText, queryAllByText, queryByPlaceholderText } = render(
    <Provider store={mockStore(testStore)}>
      <CreatePipelineRun open />
    </Provider>
  );
  expect(queryByText(/create pipelinerun/i)).toBeTruthy();
  expect(queryByText(/select namespace/i)).toBeTruthy();
  expect(queryByText(/select pipeline/i)).toBeTruthy();
  expect(queryByText(/select service account/i)).toBeTruthy();
  expect(queryByPlaceholderText(/duration/i)).toBeTruthy();
  expect(queryByText(/cancel/i)).toBeTruthy();
  expect(submitButton(queryAllByText)).toBeTruthy();
});

it('CreatePipelineRun renders pipeline', () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const {
    getByText,
    getAllByText,
    getByPlaceholderText,
    queryByText,
    queryByValue
  } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  expect(queryByText(/namespace-1/i)).toBeTruthy();
  // Select pipeline-1 and verify spec details are displayed
  selectPipeline1(getByText);
  testPipelineSpec('id-pipeline-1', queryByText, queryByValue);
  // Fill pipeline spec
  fillPipeline1Resources(getByText);
  fillPipeline1Params(getByPlaceholderText);
  expect(queryByText(/pipeline-resource-1/i)).toBeTruthy();
  expect(queryByText(/pipeline-resource-2/i)).toBeTruthy();
  expect(queryByValue(/value-1/i)).toBeTruthy();
  expect(queryByValue(/value-2/i)).toBeTruthy();
  // Select pipeline-1 and verify spec details do not change
  fireEvent.click(getAllByText(/pipeline-1/i)[1]);
  fireEvent.click(getAllByText(/pipeline-1/i)[2]);

  // Select pipeline-2 and verify spec details are displayed
  fireEvent.click(getAllByText(/pipeline-1/i)[1]);
  fireEvent.click(getByText(/pipeline-2/i));
  testPipelineSpec('id-pipeline-2', queryByText, queryByValue);
});

it('CreatePipelineRun renders pipeline controlled', () => {
  // Display with pipeline-1 selected
  const mockTestStore = mockStore(testStore);
  const { rerender, queryByText, queryByValue } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} pipelineRef="pipeline-1" />
    </Provider>
  );
  expect(queryByText(/namespace-1/i)).toBeFalsy();
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  // Verify spec details are displayed
  testPipelineSpec('id-pipeline-1', queryByText, queryByValue);
  // Change selection to pipeline-2
  rerender(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} pipelineRef="pipeline-2" />
    </Provider>
  );
  testPipelineSpec('id-pipeline-2', queryByText, queryByValue);
});

it('CreatePipelineRun resets pipeline and service account when namespace changes', () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const { getByText, getAllByText, queryByText } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
  // Change selected namespace to the same namespace (expect no change)
  fireEvent.click(getByText(/namespace-1/i));
  fireEvent.click(getAllByText(/namespace-1/i)[1]);
  expect(queryByText(/pipeline-1/i)).toBeTruthy();
  expect(queryByText(/service-account-1/i)).toBeTruthy();
  // Change selected namespace
  fireEvent.click(getByText(/namespace-1/i));
  fireEvent.click(getByText(/namespace-2/i));
  // Verify that pipeline and service account value have reset
  expect(queryByText(/select pipeline/i)).toBeTruthy();
  expect(queryByText(/select service account/i)).toBeTruthy();
});

it('CreatePipelineRun resets pipeline and service account when namespace changes controlled', () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const { rerender, getByText, queryByText } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  fireEvent.click(getByText(/select pipeline/i));
  fireEvent.click(getByText(/pipeline-1/i));
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
  // Change selected namespace
  rerender(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} namespace="namespace-2" />
    </Provider>
  );
  // Verify that pipeline and service account value have reset
  expect(queryByText(/select pipeline/i)).toBeTruthy();
  expect(queryByText(/select service account/i)).toBeTruthy();
});

it('CreatePipelineRun submits form', () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const {
    getByText,
    getAllByText,
    getByPlaceholderText,
    queryByText,
    queryByValue
  } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  expect(queryByText(/namespace-1/i)).toBeTruthy();
  // Select pipeline-1 and verify spec details are displayed
  selectPipeline1(getByText);
  testPipelineSpec('id-pipeline-1', queryByText, queryByValue);
  // Fill pipeline spec
  fillPipeline1Resources(getByText);
  fillPipeline1Params(getByPlaceholderText);
  // Fill service account
  fireEvent.click(getByText(/select service account/i));
  fireEvent.click(getByText(/service-account-1/i));
  // Fill timeout
  fireEvent.change(getByPlaceholderText(/duration/i), {
    target: { value: '120' }
  });
  // Submit
  const createPipelineRun = jest
    .spyOn(API, 'createPipelineRunAtProxy')
    .mockImplementation(() => Promise.resolve({}));
  fireEvent.click(submitButton(getAllByText));
  expect(createPipelineRun).toHaveBeenCalledTimes(1);
  const payload = {
    namespace: 'namespace-1',
    pipelineName: 'pipeline-1',
    resources: {
      'resource-1': 'pipeline-resource-1',
      'resource-2': 'pipeline-resource-2'
    },
    params: {
      'param-1': 'value-1',
      'param-2': 'value-2'
    },
    serviceAccount: 'service-account-1',
    timeout: '120'
  };
  expect(createPipelineRun).toHaveBeenCalledWith(payload);
});

it('CreatePipelineRun handles onClose event', () => {
  const onClose = jest.fn();
  const { getByText } = render(
    <Provider store={mockStore(testStore)}>
      <CreatePipelineRun open onClose={onClose} />
    </Provider>
  );
  fireEvent.click(getByText(/cancel/i));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('CreatePipelineRun validates inputs', () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  const { getByText, getAllByText, getByPlaceholderText, queryByText } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} namespace={ALL_NAMESPACES} />
    </Provider>
  );
  // Test validation error on empty form submit
  fireEvent.click(submitButton(getAllByText));
  expect(queryByText(validationErrorMsgRegExp)).toBeTruthy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(pipelineValidationErrorRegExp)).toBeTruthy();
  // Fix validation error
  fireEvent.click(getByText(/select namespace/i));
  fireEvent.click(getByText(/namespace-1/i));
  selectPipeline1(getByText);
  expect(queryByText(pipelineValidationErrorRegExp)).toBeFalsy();
  expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
  // Test validation on pipeline1 spec
  fireEvent.click(submitButton(getAllByText));
  expect(queryByText(pipelineResourceValidationErrorRegExp)).toBeTruthy();
  expect(queryByText(paramsValidationErrorRegExp)).toBeTruthy();
  // Fix validation error
  fillPipeline1Resources(getByText);
  expect(queryByText(pipelineResourceValidationErrorRegExp)).toBeFalsy();
  fillPipeline1Params(getByPlaceholderText);
  expect(queryByText(paramsValidationErrorRegExp)).toBeFalsy();
});

it('CreatePipelineRun handles error getting pipeline', () => {
  const mockTestStore = mockStore(testStore);
  jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  jest.spyOn(reducers, 'getPipeline').mockImplementation(() => null);
  const { getByText, queryByText } = render(
    <Provider store={mockTestStore}>
      <CreatePipelineRun {...props} />
    </Provider>
  );
  selectPipeline1(getByText);
  expect(queryByText(/error retrieving pipeline information/i)).toBeTruthy();
});

it('CreatePipelineRun handles error getting pipeline controlled', () => {
  jest.spyOn(reducers, 'getPipeline').mockImplementation(() => null);
  const { queryByText } = render(
    <Provider store={mockStore(testStore)}>
      <CreatePipelineRun {...props} pipelineRef="pipeline-1" />
    </Provider>
  );
  expect(queryByText(/error retrieving pipeline information/i)).toBeTruthy();
});
