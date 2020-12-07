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

import CreateTaskRun from './CreateTaskRun';
import * as PipelineResourcesAPI from '../../api/pipelineResources';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';
import * as TaskRunsAPI from '../../api/taskRuns';
import * as TasksAPI from '../../api/tasks';
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
const tasks = {
  byNamespace: {
    'namespace-1': {
      'task-1': 'id-task-1',
      'task-2': 'id-task-2'
    },
    'namespace-2': {
      'task-3': 'id-task-3'
    }
  },
  byId: {
    'id-task-1': {
      metadata: {
        name: 'task-1',
        namespace: 'namespace-1',
        uid: 'id-task-1'
      },
      spec: {
        resources: {
          inputs: [
            { name: 'resource-1', type: 'type-1' },
            { name: 'resource-2', type: 'type-2' }
          ],
          outputs: [{ name: 'resource-3', type: 'type-3' }]
        },
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
    'id-task-2': {
      metadata: {
        name: 'task-2',
        namespace: 'namespace-1',
        uid: 'id-task-2'
      },
      spec: {}
    },
    'id-task-3': {
      metadata: {
        name: 'task-3',
        namespace: 'namespace-2',
        uid: 'id-task-3'
      },
      spec: {}
    }
  },
  isFetching: false
};
const clusterTasks = {
  byName: {
    'clustertask-1': {
      metadata: {
        name: 'clustertask-1',
        uid: 'id-task-1'
      },
      spec: {}
    },
    'clustertask-2': {
      metadata: {
        name: 'clustertask-2',
        uid: 'id-task-2'
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
      'pipeline-resource-2': 'id-pipeline-resource-2',
      'pipeline-resource-3': 'id-pipeline-resource-3'
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
    },
    'id-pipeline-resource-3': {
      metadata: { name: 'pipeline-resource-3' },
      spec: { type: 'type-3' }
    }
  },
  isFetching: false
};
const taskRuns = {
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
  properties: {},
  taskRuns,
  tasks,
  clusterTasks,
  serviceAccounts
};

const props = {
  open: false,
  namespace: 'namespace-1',
  kind: 'Task'
};

const validationErrorMsgRegExp = /please fix the fields with errors, then resubmit/i;
const namespaceValidationErrorRegExp = /namespace cannot be empty/i;
const taskValidationErrorRegExp = /task cannot be empty/i;
const pipelineResourceValidationErrorRegExp = /pipelineresources cannot be empty/i;
const paramsValidationErrorRegExp = /params cannot be empty/i;
const apiErrorRegExp = /error creating taskrun/i;
const timeoutValidationErrorRegExp = /Timeout must be a valid number less than 525600/i;
const labelsValidationErrorRegExp = /Labels must follow the/i;

const submitButton = allByText => allByText(/create/i)[1];

const testTaskSpec = (taskId, queryByText, queryByDisplayValue) => {
  // Verify proper param and resource fields are displayed
  const task = tasks.byId[taskId];
  const paramsRegExp = /params/i;
  const resourcesRegExp = /resources/i;
  if (task.spec.params) {
    expect(queryByText(paramsRegExp)).toBeTruthy();
    task.spec.params.forEach(param => {
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
  if (task.spec.resources) {
    if (task.spec.resources.inputs) {
      expect(queryByText('Input PipelineResources')).toBeTruthy();
      task.spec.resources.inputs.forEach(resource => {
        expect(queryByText(new RegExp(resource.name, 'i'))).toBeTruthy();
        expect(queryByText(new RegExp(resource.type, 'i'))).toBeTruthy();
      });
    }
    if (task.spec.resources.outputs) {
      expect(queryByText('Output PipelineResources')).toBeTruthy();
      task.spec.resources.outputs.forEach(resource => {
        expect(queryByText(new RegExp(resource.name, 'i'))).toBeTruthy();
        expect(queryByText(new RegExp(resource.type, 'i'))).toBeTruthy();
      });
    }
  } else {
    expect(queryByText(resourcesRegExp)).toBeFalsy();
  }
};

const selectTask1 = async ({ getByPlaceholderText, getByText }) => {
  fireEvent.click(getByPlaceholderText(/select task/i));
  const task1 = await waitForElement(() => getByText(/task-1/i));
  fireEvent.click(task1);
};

const fillTask1Resources = ({ getAllByPlaceholderText, getByTitle }) => {
  const resourceDropdowns = getAllByPlaceholderText(/select pipelineresource/i);
  fireEvent.click(resourceDropdowns[0]);
  fireEvent.click(getByTitle(/pipeline-resource-1/i));
  fireEvent.click(resourceDropdowns[1]);
  fireEvent.click(getByTitle(/pipeline-resource-2/i));
  fireEvent.click(resourceDropdowns[2]);
  fireEvent.click(getByTitle(/pipeline-resource-3/i));
};

const fillTask1Params = getByPlaceholderText => {
  fireEvent.change(getByPlaceholderText(/default-1/i), {
    target: { value: 'value-1' }
  });
  fireEvent.change(getByPlaceholderText(/param-2/i), {
    target: { value: 'value-2' }
  });
};

const selectTask1AndFillSpec = async ({
  getAllByPlaceholderText,
  getByPlaceholderText,
  getByText,
  getByTitle,
  queryByText,
  queryByDisplayValue
}) => {
  // Select task-1 and verify spec details are displayed
  await selectTask1({ getByPlaceholderText, getByText });
  testTaskSpec('id-task-1', queryByText, queryByDisplayValue);
  // Fill task spec
  fillTask1Resources({ getAllByPlaceholderText, getByTitle });
  fillTask1Params(getByPlaceholderText);
};

describe('CreateTaskRun', () => {
  beforeEach(() => {
    jest
      .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
      .mockImplementation(() => serviceAccounts.byId);
    jest.spyOn(TasksAPI, 'getTasks').mockImplementation(() => tasks.byId);
    jest
      .spyOn(PipelineResourcesAPI, 'getPipelineResources')
      .mockImplementation(() => pipelineResources.byId);
    jest
      .spyOn(TaskRunsAPI, 'getTaskRuns')
      .mockImplementation(() => taskRuns.byId);

    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  });

  it('handles api error', async () => {
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
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>,
      { rerender }
    );
    await selectTask1AndFillSpec({
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
    const createTaskRun = jest
      .spyOn(TaskRunsAPI, 'createTaskRun')
      .mockImplementation(() => Promise.reject(errorResponseMock));
    fireEvent.click(submitButton(getAllByText));
    await wait(() => expect(createTaskRun).toHaveBeenCalledTimes(1));
    await waitForElement(() => getByText(apiErrorRegExp));
    await waitForElement(() => getByText(/error code 400/i));
    fireEvent.click(getByTitle(/closes notification/i));
  });

  it('handles api error with text', async () => {
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
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>,
      { rerender }
    );
    await selectTask1AndFillSpec({
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
    const createTaskRun = jest
      .spyOn(TaskRunsAPI, 'createTaskRun')
      .mockImplementation(() => Promise.reject(errorResponseMock));
    fireEvent.click(submitButton(getAllByText));
    await wait(() => expect(createTaskRun).toHaveBeenCalledTimes(1));
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
        <CreateTaskRun open namespace="" kind="Task" />
      </Provider>
    );
    expect(queryByText(/create taskrun/i)).toBeTruthy();
    expect(queryByPlaceholderText(/select namespace/i)).toBeTruthy();
    expect(queryByPlaceholderText(/select task/i)).toBeTruthy();
    expect(document.querySelector('[label="Select Task"]').disabled).toBe(true);
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
      expect(document.querySelector('[label="Select Task"]').disabled).toBe(
        false
      )
    );
    await wait(() =>
      expect(
        document.querySelector('[label="Select ServiceAccount"]').disabled
      ).toBe(false)
    );
  });

  it('renders task', async () => {
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryByDisplayValue,
      queryByText,
      rerender
    } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/namespace-1/i)).toBeTruthy();
    // Select task-1 and verify spec details are displayed
    await selectTask1({ getByPlaceholderText, getByText });
    testTaskSpec('id-task-1', queryByText, queryByDisplayValue);
    // Fill task spec
    fillTask1Resources({
      getAllByPlaceholderText,
      getByTitle
    });
    fillTask1Params(getByPlaceholderText);
    expect(queryByDisplayValue(/pipeline-resource-1/i)).toBeTruthy();
    expect(queryByDisplayValue(/pipeline-resource-2/i)).toBeTruthy();
    expect(queryByDisplayValue(/value-1/i)).toBeTruthy();
    expect(queryByDisplayValue(/value-2/i)).toBeTruthy();

    // Select task-2 and verify spec details are displayed
    fireEvent.click(queryByDisplayValue(/task-1/i));
    fireEvent.click(await waitForElement(() => getByTitle(/task-2/i)));
    testTaskSpec('id-task-2', queryByText, queryByDisplayValue);
  });

  it('renders task controlled', async () => {
    // Display with task-1 selected

    const {
      getByDisplayValue,
      queryAllByLabelText,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} taskRef="task-1" />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open taskRef="task-1" />
      </Provider>,
      { rerender }
    );
    await waitForElement(() => getByDisplayValue(/task-1/i));
    expect(queryAllByLabelText('Namespace')[0]).toBeTruthy();
    // Verify spec details are displayed
    testTaskSpec('id-task-1', queryByText, queryByDisplayValue);
  });

  it('renders labels', () => {
    const {
      getAllByText,
      getByText,
      getByPlaceholderText,
      queryByDisplayValue
    } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun open namespace="" />
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

  it('resets Task and ServiceAccount when namespace changes', async () => {
    const {
      getByPlaceholderText,
      getByTitle,
      getByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>,
      { rerender }
    );
    fireEvent.click(getByPlaceholderText(/select task/i));
    fireEvent.click(await waitForElement(() => getByTitle(/task-1/i)));
    fireEvent.click(getByPlaceholderText(/select serviceaccount/i));
    fireEvent.click(
      await waitForElement(() => getByTitle(/service-account-1/i))
    );
    // Change selected namespace to the same namespace (expect no change)
    fireEvent.click(getByDisplayValue(/namespace-1/i));
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-1/i)));

    expect(getByDisplayValue(/task-1/i)).toBeTruthy();
    expect(getByDisplayValue(/service-account-1/i)).toBeTruthy();
    // Change selected namespace
    fireEvent.click(getByDisplayValue(/namespace-1/i));
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-2/i)));

    // Verify that Task and ServiceAccount value have reset
    expect(getByPlaceholderText(/select task/i)).toBeTruthy();
    expect(getByPlaceholderText(/select serviceaccount/i)).toBeTruthy();
  });

  it('submits form', async () => {
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
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>,
      { rerender }
    );
    expect(queryByDisplayValue(/namespace-1/i)).toBeTruthy();
    // Select task-1 and verify spec details are displayed
    await selectTask1({ getByPlaceholderText, getByText });
    testTaskSpec('id-task-1', queryByText, queryByDisplayValue);
    // Fill task spec
    fillTask1Resources({ getAllByPlaceholderText, getByTitle });
    fillTask1Params(getByPlaceholderText);
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
    const createTaskRun = jest
      .spyOn(TaskRunsAPI, 'createTaskRun')
      .mockImplementation(() => Promise.resolve({}));
    fireEvent.click(submitButton(getAllByText));
    expect(createTaskRun).toHaveBeenCalledTimes(1);
    const payload = {
      namespace: 'namespace-1',
      kind: 'Task',
      taskName: 'task-1',
      labels: {
        foo: 'bar'
      },
      nodeSelector: null,
      resources: {
        inputs: {
          'resource-1': 'pipeline-resource-1',
          'resource-2': 'pipeline-resource-2'
        },
        outputs: {
          'resource-3': 'pipeline-resource-3'
        }
      },
      params: {
        'param-1': 'value-1',
        'param-2': 'value-2'
      },
      serviceAccount: 'service-account-1',
      timeout: '120m'
    };
    expect(createTaskRun).toHaveBeenCalledWith(payload);
  });

  it('handles onClose event', () => {
    const onClose = jest.fn();
    const { getByText } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun open onClose={onClose} />
      </Provider>
    );
    fireEvent.click(getByText(/cancel/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('validates inputs', async () => {
    const {
      getAllByPlaceholderText,
      getAllByText,
      getByPlaceholderText,
      getByText,
      getByTitle,
      queryAllByText,
      queryByText
    } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} namespace={ALL_NAMESPACES} />
      </Provider>
    );
    // Test validation error on empty form submit
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(validationErrorMsgRegExp)).toBeTruthy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeTruthy();
    expect(queryByText(taskValidationErrorRegExp)).toBeTruthy();
    // Fix validation error
    fireEvent.click(getByPlaceholderText(/select namespace/i));
    fireEvent.click(await waitForElement(() => getByTitle(/namespace-1/i)));

    await selectTask1({ getByPlaceholderText, getByText });
    expect(queryByText(taskValidationErrorRegExp)).toBeFalsy();
    expect(queryByText(namespaceValidationErrorRegExp)).toBeFalsy();
    // Test validation on task1 spec
    fireEvent.click(submitButton(getAllByText));
    expect(
      queryAllByText(pipelineResourceValidationErrorRegExp)[0]
    ).toBeTruthy();
    expect(queryByText(paramsValidationErrorRegExp)).toBeTruthy();
    // Fix validation error
    fillTask1Resources({ getAllByPlaceholderText, getByTitle });
    expect(
      queryAllByText(pipelineResourceValidationErrorRegExp)[0]
    ).toBeFalsy();
    fillTask1Params(getByPlaceholderText);
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
    fireEvent.change(document.getElementById('create-taskrun--timeout'), {
      target: { value: ' ' }
    });
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(timeoutValidationErrorRegExp)).toBeTruthy();
    fireEvent.change(document.getElementById('create-taskrun--timeout'), {
      target: { value: '525600' }
    });
    fireEvent.click(submitButton(getAllByText));
    expect(queryByText(timeoutValidationErrorRegExp)).toBeTruthy();
  });

  it('handles error getting task', async () => {
    jest.spyOn(reducers, 'getTask').mockImplementation(() => null);
    const { getByPlaceholderText, getByText, queryByText } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    await selectTask1({ getByPlaceholderText, getByText });
    expect(queryByText(/error retrieving task information/i)).toBeTruthy();
  });

  it('handles error getting task controlled', () => {
    const badTaskRef = 'task-thisDoesNotExist';
    const { getByPlaceholderText, queryByText, rerender } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} taskRef={badTaskRef} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open taskRef={badTaskRef} />
      </Provider>,
      { rerender }
    );
    expect(queryByText('task-thisDoesNotExist')).toBeFalsy();
    expect(getByPlaceholderText(/select task/i)).toBeTruthy();
  });

  it('checks that pressing x on Task doesnt cause errors', async () => {
    const {
      getByPlaceholderText,
      getByText,
      getByDisplayValue,
      queryAllByTitle,
      queryByText,
      queryByDisplayValue,
      rerender
    } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>,
      { rerender }
    );
    // Select task-1 and verify spec details are displayed
    await selectTask1({ getByPlaceholderText, getByText });
    testTaskSpec('id-task-1', queryByText, queryByDisplayValue);
    expect(getByDisplayValue('task-1')).toBeTruthy();

    fireEvent.click(queryAllByTitle(/clear selected item/i)[1]);
    expect(getByDisplayValue(/namespace-1/i)).toBeTruthy();
    expect(queryByText('Select PipelineResource')).toBeFalsy();
  });

  it('handles close', () => {
    const { getByText } = renderWithIntl(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} open />
      </Provider>
    );

    fireEvent.click(getByText(/cancel/i));
  });
});
