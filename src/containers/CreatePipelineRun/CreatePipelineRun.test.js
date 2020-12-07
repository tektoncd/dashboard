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
import { fireEvent, wait, waitForElement } from '@testing-library/react';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import CreatePipelineRun from './CreatePipelineRun';
import * as PipelineResourcesAPI from '../../api/pipelineResources';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
import * as PipelinesAPI from '../../api/pipelines';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';
import * as store from '../../store';
import * as reducers from '../../reducers';

const namespaces = {
  selected: 'namespace-1',
  byName: {
    'namespace-1': '',
    'namespace-2': ''
  },
  isFetching: false
};
const pipelines = {
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
};
const serviceAccounts = {
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
};
const pipelineResources = {
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
};
const pipelineRuns = {
  isFetching: false,
  byId: {},
  byNamespace: {}
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  namespaces,
  notifications: {},
  pipelineResources,
  pipelineRuns,
  pipelines,
  properties: {},
  serviceAccounts
};

const props = {
  open: false,
  namespace: 'namespace-1'
};

const validationErrorMsgRegExp = /please fix the fields with errors, then resubmit/i;
const namespaceValidationErrorRegExp = /namespace cannot be empty/i;
const pipelineValidationErrorRegExp = /pipeline cannot be empty/i;
const pipelineResourceValidationErrorRegExp = /pipelineresources cannot be empty/i;
const paramsValidationErrorRegExp = /params cannot be empty/i;
const apiErrorRegExp = /error creating pipelinerun/i;
const timeoutValidationErrorRegExp = /Timeout must be a valid number less than 525600/i;
const labelsValidationErrorRegExp = /Labels must follow the/i;

const submitButton = allByText => allByText(/create/i)[1];

const testPipelineSpec = (pipelineId, queryByText, queryByDisplayValue) => {
  // Verify proper param and resource fields are displayed
  const pipeline = pipelines.byId[pipelineId];
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
        expect(
          queryByDisplayValue(new RegExp(param.default, 'i'))
        ).toBeTruthy();
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

const selectPipeline1 = async ({ getByPlaceholderText, getByText }) => {
  fireEvent.click(getByPlaceholderText(/select pipeline/i));
  const pipeline1 = await waitForElement(() => getByText(/pipeline-1/i));
  fireEvent.click(pipeline1);
};

const fillPipeline1Resources = ({ getAllByPlaceholderText, getByTitle }) => {
  const resourceDropdowns = getAllByPlaceholderText(/select pipelineresource/i);
  fireEvent.click(resourceDropdowns[0]);
  fireEvent.click(getByTitle(/pipeline-resource-1/i));
  fireEvent.click(resourceDropdowns[1]);
  fireEvent.click(getByTitle(/pipeline-resource-2/i));
};

const fillPipeline1Params = getByPlaceholderText => {
  fireEvent.change(getByPlaceholderText(/default-1/i), {
    target: { value: 'value-1' }
  });
  fireEvent.change(getByPlaceholderText(/param-2/i), {
    target: { value: 'value-2' }
  });
};

const selectPipeline1AndFillSpec = async ({
  getAllByPlaceholderText,
  getByPlaceholderText,
  getByText,
  getByTitle,
  queryByText,
  queryByDisplayValue
}) => {
  // Select pipeline-1 and verify spec details are displayed
  await selectPipeline1({ getByPlaceholderText, getByText });
  testPipelineSpec('id-pipeline-1', queryByText, queryByDisplayValue);
  // Fill pipeline spec
  fillPipeline1Resources({ getAllByPlaceholderText, getByTitle });
  fillPipeline1Params(getByPlaceholderText);
};

describe('CreatePipelineRun', () => {
  beforeEach(() => {
    jest
      .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
      .mockImplementation(() => serviceAccounts.byId);
    jest
      .spyOn(PipelinesAPI, 'getPipelines')
      .mockImplementation(() => pipelines.byId);
    jest
      .spyOn(PipelineResourcesAPI, 'getPipelineResources')
      .mockImplementation(() => pipelineResources.byId);
    jest
      .spyOn(PipelineRunsAPI, 'getPipelineRuns')
      .mockImplementation(() => pipelineRuns.byId);
  });

  it('handles api error', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getAllByPlaceholderText,
      getAllByText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );

    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>,
      { rerender }
    );

    await selectPipeline1AndFillSpec({
      getAllByPlaceholderText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByText,
      queryByDisplayValue
    });
    // Submit
    const errorResponseMock = {
      response: { status: 400, text: () => Promise.resolve('') }
    };
    const createPipelineRun = jest
      .spyOn(PipelineRunsAPI, 'createPipelineRun')
      .mockImplementation(() => Promise.reject(errorResponseMock));
    fireEvent.click(submitButton(getAllByText));
    await wait(() => expect(createPipelineRun).toHaveBeenCalledTimes(1));
    await waitForElement(() => getByText(apiErrorRegExp));
    await waitForElement(() => getByText(/error code 400/i));
    fireEvent.click(getByTitle(/closes notification/i));
  });

  it('handles api error with text', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getAllByPlaceholderText,
      getAllByText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );

    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>,
      { rerender }
    );

    await selectPipeline1AndFillSpec({
      getAllByPlaceholderText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByText,
      queryByDisplayValue
    });
    // Submit
    const errorResponseMock = {
      response: { status: 401, text: () => Promise.resolve('example message') }
    };
    const createPipelineRun = jest
      .spyOn(PipelineRunsAPI, 'createPipelineRun')
      .mockImplementation(() => Promise.reject(errorResponseMock));
    fireEvent.click(submitButton(getAllByText));
    await wait(() => expect(createPipelineRun).toHaveBeenCalledTimes(1));
    await waitForElement(() => getByText(apiErrorRegExp));
    await waitForElement(() =>
      getByText(/example message \(error code 401\)/i)
    );
  });

  it('renders empty, dropdowns disabled when no namespace selected', async () => {
    const {
      getByPlaceholderText,
      getByTitle,
      queryByText,
      queryAllByText,
      queryByPlaceholderText
    } = renderWithIntl(
      <Provider store={mockStore(testStore)}>
        <CreatePipelineRun open namespace="" />
      </Provider>
    );
    expect(queryByText(/create pipelinerun/i)).toBeTruthy();
    expect(queryByPlaceholderText(/select namespace/i)).toBeTruthy();
    expect(queryByPlaceholderText(/select pipeline/i)).toBeTruthy();
    expect(document.querySelector('[label="Select Pipeline"]').disabled).toBe(
      true
    );
    expect(queryByPlaceholderText(/select serviceaccount/i)).toBeTruthy();
    expect(
      document.querySelector('[label="Select ServiceAccount"]').disabled
    ).toBe(true);
    expect(queryByPlaceholderText(/60/i)).toBeTruthy();
    expect(queryByText(/cancel/i)).toBeTruthy();
    expect(submitButton(queryAllByText)).toBeTruthy();

    // Check dropdowns enabled when namespace selected
    fireEvent.click(
      await waitForElement(() => getByPlaceholderText(/select namespace/i))
    );
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-1/i)));
    await wait(() =>
      expect(document.querySelector('[label="Select Pipeline"]').disabled).toBe(
        false
      )
    );
    await wait(() =>
      expect(
        document.querySelector('[label="Select ServiceAccount"]').disabled
      ).toBe(false)
    );
  });

  it('renders pipeline', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByDisplayValue,
      queryByText,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );

    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>,
      { rerender }
    );

    expect(queryByDisplayValue(/namespace-1/i)).toBeTruthy();
    // Select pipeline-1 and verify spec details are displayed
    await selectPipeline1({ getByPlaceholderText, getByText });
    testPipelineSpec('id-pipeline-1', queryByText, queryByDisplayValue);
    // Fill pipeline spec
    fillPipeline1Resources({
      getAllByPlaceholderText,
      getByTitle
    });
    fillPipeline1Params(getByPlaceholderText);
    expect(queryByDisplayValue(/pipeline-resource-1/i)).toBeTruthy();
    expect(queryByDisplayValue(/pipeline-resource-2/i)).toBeTruthy();
    expect(queryByDisplayValue(/value-1/i)).toBeTruthy();
    expect(queryByDisplayValue(/value-2/i)).toBeTruthy();

    // Select pipeline-2 and verify spec details are displayed
    fireEvent.click(queryByDisplayValue(/pipeline-1/i));
    fireEvent.click(await waitForElement(() => getByTitle(/pipeline-2/i)));
    testPipelineSpec('id-pipeline-2', queryByText, queryByDisplayValue);
  });

  it('renders pipeline controlled', async () => {
    // Display with pipeline-1 selected
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);

    const {
      getByDisplayValue,
      queryAllByLabelText,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );

    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open pipelineRef="pipeline-1" />
      </Provider>,
      { rerender }
    );

    await waitForElement(() => getByDisplayValue(/pipeline-1/i));
    expect(queryAllByLabelText('Namespace')[0]).toBeTruthy();
    // Verify spec details are displayed
    testPipelineSpec('id-pipeline-1', queryByText, queryByDisplayValue);
  });

  it('renders labels', () => {
    const {
      getAllByText,
      getByText,
      getByPlaceholderText,
      queryByDisplayValue
    } = renderWithIntl(
      <Provider store={mockStore(testStore)}>
        <CreatePipelineRun open namespace="" />
      </Provider>
    );
    fireEvent.click(getAllByText(/Add/i)[0]);
    fireEvent.change(getByPlaceholderText(/key/i), {
      target: { value: 'foo' }
    });
    fireEvent.change(getByPlaceholderText(/value/i), {
      target: { value: 'bar' }
    });
    expect(queryByDisplayValue(/foo/i)).toBeTruthy();
    expect(queryByDisplayValue(/bar/i)).toBeTruthy();
    fireEvent.click(getByText(/Remove/i));
    expect(queryByDisplayValue(/foo/i)).toBeFalsy();
    expect(queryByDisplayValue(/bar/i)).toBeFalsy();
  });

  it('resets Pipeline and ServiceAccount when namespace changes', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getByPlaceholderText,
      getByTitle,
      getByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>,
      { rerender }
    );
    fireEvent.click(getByPlaceholderText(/select pipeline/i));
    fireEvent.click(await waitForElement(() => getByTitle(/pipeline-1/i)));
    fireEvent.click(getByPlaceholderText(/select serviceaccount/i));
    fireEvent.click(
      await waitForElement(() => getByTitle(/service-account-1/i))
    );
    // Change selected namespace to the same namespace (expect no change)
    fireEvent.click(getByDisplayValue(/namespace-1/i));
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-1/i)));

    expect(getByDisplayValue(/pipeline-1/i)).toBeTruthy();
    expect(getByDisplayValue(/service-account-1/i)).toBeTruthy();
    // Change selected namespace
    fireEvent.click(getByDisplayValue(/namespace-1/i));
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-2/i)));

    // Verify that Pipeline and ServiceAccount value have reset
    expect(getByPlaceholderText(/select pipeline/i)).toBeTruthy();
    expect(getByPlaceholderText(/select serviceaccount/i)).toBeTruthy();
  });

  it('submits form', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getAllByPlaceholderText,
      getAllByText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/namespace-1/i)).toBeTruthy();
    // Select pipeline-1 and verify spec details are displayed
    await selectPipeline1({ getByPlaceholderText, getByText });
    testPipelineSpec('id-pipeline-1', queryByText, queryByDisplayValue);
    // Fill pipeline spec
    fillPipeline1Resources({ getAllByPlaceholderText, getByTitle });
    fillPipeline1Params(getByPlaceholderText);
    // Fill ServiceAccount
    fireEvent.click(getByPlaceholderText(/select serviceaccount/i));
    fireEvent.click(
      await waitForElement(() => getByTitle(/service-account-1/i))
    );
    // Fill timeout
    fireEvent.change(getByPlaceholderText(/60/i), {
      target: { value: '120' }
    });
    // Fill label
    fireEvent.click(getAllByText(/Add/i)[0]);
    fireEvent.change(getByPlaceholderText(/key/i), {
      target: { value: 'foo' }
    });
    fireEvent.change(getByPlaceholderText(/value/i), {
      target: { value: 'bar' }
    });
    // Submit
    const createPipelineRun = jest
      .spyOn(PipelineRunsAPI, 'createPipelineRun')
      .mockImplementation(() => Promise.resolve({}));
    fireEvent.click(submitButton(getAllByText));
    expect(createPipelineRun).toHaveBeenCalledTimes(1);
    const payload = {
      namespace: 'namespace-1',
      pipelineName: 'pipeline-1',
      labels: {
        foo: 'bar'
      },
      nodeSelector: null,
      resources: {
        'resource-1': 'pipeline-resource-1',
        'resource-2': 'pipeline-resource-2'
      },
      params: {
        'param-1': 'value-1',
        'param-2': 'value-2'
      },
      serviceAccount: 'service-account-1',
      timeout: '120m'
    };
    expect(createPipelineRun).toHaveBeenCalledWith(payload);
  });

  it('handles onClose event', () => {
    const onClose = jest.fn();
    const { getByText } = renderWithIntl(
      <Provider store={mockStore(testStore)}>
        <CreatePipelineRun open onClose={onClose} />
      </Provider>
    );
    fireEvent.click(getByText(/cancel/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('validates inputs', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getAllByPlaceholderText,
      getAllByText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryAllByText,
      queryByText
    } = renderWithIntl(
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
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-1/i)));

    await selectPipeline1({ getByPlaceholderText, getByText });
    expect(queryByText(pipelineValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
    // Test validation on pipeline1 spec
    fireEvent.click(submitButton(getAllByText));
    expect(
      queryAllByText(pipelineResourceValidationErrorRegExp)[0]
    ).toBeTruthy();
    expect(queryByText(paramsValidationErrorRegExp)).toBeTruthy();
    // Fix validation error
    fillPipeline1Resources({ getAllByPlaceholderText, getByTitle });
    expect(
      queryAllByText(pipelineResourceValidationErrorRegExp)[0]
    ).toBeFalsy();
    fillPipeline1Params(getByPlaceholderText);
    expect(queryByText(paramsValidationErrorRegExp)).toBeFalsy();
    // Test validation on labels
    fireEvent.click(getAllByText(/Add/i)[0]);
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(labelsValidationErrorRegExp)).toBeTruthy();
    fireEvent.change(getByPlaceholderText(/key/i), {
      target: { value: 'invalid key' }
    });
    expect(queryByText(labelsValidationErrorRegExp)).toBeTruthy();
    // Fix validation error
    fireEvent.change(getByPlaceholderText(/key/i), {
      target: { value: 'foo' }
    });
    fireEvent.change(getByPlaceholderText(/value/i), {
      target: { value: 'bar' }
    });
    expect(queryByText(labelsValidationErrorRegExp)).toBeFalsy();
    // Test invalid timeouts
    fireEvent.change(getByPlaceholderText(/60/i), {
      target: { value: '120m' }
    });
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(timeoutValidationErrorRegExp)).toBeTruthy();
    // Test invalid timeouts for empty Timeout
    fireEvent.change(document.getElementById('create-pipelinerun--timeout'), {
      target: { value: ' ' }
    });
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(timeoutValidationErrorRegExp)).toBeTruthy();
    fireEvent.change(document.getElementById('create-pipelinerun--timeout'), {
      target: { value: '525600' }
    });
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(timeoutValidationErrorRegExp)).toBeTruthy();
  });

  it('handles error getting pipeline', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    jest.spyOn(reducers, 'getPipeline').mockImplementation(() => null);
    const { getByPlaceholderText, getByText, queryByText } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );
    await selectPipeline1({ getByPlaceholderText, getByText });
    expect(queryByText(/error retrieving pipeline information/i)).toBeTruthy();
  });

  it('handles error getting pipeline controlled', () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const badPipelineRef = 'pipeline-thisDoesNotExist';
    const { getByPlaceholderText, queryByText, rerender } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} pipelineRef={badPipelineRef} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={mockStore(testStore)}>
        <CreatePipelineRun {...props} open pipelineRef={badPipelineRef} />
      </Provider>,
      { rerender }
    );
    expect(queryByText('pipeline-thisDoesNotExist')).toBeFalsy();
    expect(getByPlaceholderText(/select pipeline/i)).toBeTruthy();
  });

  it('checks that pressing x on Pipeline doesnt cause errors', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
    const {
      getByPlaceholderText,
      getByText,
      getByDisplayValue,
      queryAllByTitle,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>,
      { rerender }
    );
    // Select task-1 and verify spec details are displayed
    await selectPipeline1({ getByPlaceholderText, getByText });
    testPipelineSpec('id-pipeline-1', queryByText, queryByDisplayValue);
    expect(getByDisplayValue('pipeline-1')).toBeTruthy();

    fireEvent.click(queryAllByTitle(/clear selected item/i)[1]);
    expect(getByDisplayValue(/namespace-1/i)).toBeTruthy();
    expect(queryByText('Select PipelineResource')).toBeFalsy();
  });

  it('handles close', () => {
    const mockTestStore = mockStore(testStore);
    const { getByText } = renderWithIntl(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} open />
      </Provider>
    );

    fireEvent.click(getByText(/cancel/i));
  });
});
