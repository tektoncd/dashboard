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
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { render } from '../../utils/test';

import CreateTaskRun from './CreateTaskRun';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as PipelineResourcesAPI from '../../api/pipelineResources';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';
import * as TaskRunsAPI from '../../api/taskRuns';
import * as ClusterTasksAPI from '../../api/clusterTasks';
import * as TasksAPI from '../../api/tasks';
import * as store from '../../store';

const tasks = [
  {
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
  {
    metadata: {
      name: 'task-2',
      namespace: 'namespace-1',
      uid: 'id-task-2'
    },
    spec: {}
  },
  {
    metadata: {
      name: 'task-3',
      namespace: 'namespace-2',
      uid: 'id-task-3'
    },
    spec: {}
  }
];
const clusterTasks = [
  {
    metadata: {
      name: 'clustertask-1',
      uid: 'id-task-1'
    },
    spec: {}
  },
  {
    metadata: {
      name: 'clustertask-2',
      uid: 'id-task-2'
    },
    spec: {}
  }
];

const serviceAccount = {
  metadata: {
    name: 'service-account-1',
    namespace: 'namespace-1',
    uid: 'id-service-account-1'
  }
};

const pipelineResource1 = {
  metadata: { name: 'pipeline-resource-1' },
  spec: { type: 'type-1' }
};

const pipelineResource2 = {
  metadata: { name: 'pipeline-resource-2' },
  spec: { type: 'type-2' }
};

const pipelineResource3 = {
  metadata: { name: 'pipeline-resource-3' },
  spec: { type: 'type-3' }
};

const taskRuns = {
  isFetching: false,
  byId: {},
  byNamespace: {}
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  notifications: {}
};

const props = {
  history: {
    push: () => {}
  },
  location: {
    search: ''
  }
};

const submitButton = allByText => allByText('Create')[0];

describe('CreateTaskRun', () => {
  beforeEach(() => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({ data: [serviceAccount] }));
    jest
      .spyOn(TasksAPI, 'useTasks')
      .mockImplementation(() => ({ data: tasks }));
    jest
      .spyOn(ClusterTasksAPI, 'useClusterTasks')
      .mockImplementation(() => ({ data: clusterTasks }));
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({
        data: [pipelineResource1, pipelineResource2, pipelineResource3]
      }));
    jest
      .spyOn(TaskRunsAPI, 'getTaskRuns')
      .mockImplementation(() => taskRuns.byId);

    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['namespace-1', 'namespace-2'] }));

    const mockTestStore = mockStore(testStore);
    jest.spyOn(store, 'getStore').mockImplementation(() => mockTestStore);
  });

  it('renders empty, dropdowns disabled when no namespace selected', async () => {
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
    const {
      getByPlaceholderText,
      getByText,
      queryByText,
      queryAllByText,
      queryByPlaceholderText
    } = render(
      <Provider store={mockStore(testStore)}>
        <CreateTaskRun {...props} location={{ search: '?kind=Task' }} />
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
      await waitFor(() => getByPlaceholderText(/select namespace/i))
    );
    fireEvent.click(await waitFor(() => getByText(/namespace-1/i)));
    await waitFor(() =>
      expect(document.querySelector('[label="Select Task"]').disabled).toBe(
        false
      )
    );
    await waitFor(() =>
      expect(
        document.querySelector('[label="Select ServiceAccount"]').disabled
      ).toBe(false)
    );
  });

  it('renders labels', () => {
    const {
      getAllByText,
      getByText,
      getByPlaceholderText,
      queryByDisplayValue
    } = render(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
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
    fireEvent.click(getByText(/Remove/i).parentNode);
    expect(queryByDisplayValue(/foo/i)).toBeFalsy();
    expect(queryByDisplayValue(/bar/i)).toBeFalsy();
  });

  it('resets Task and ServiceAccount when namespace changes', async () => {
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'namespace-1' }));

    const { getByPlaceholderText, getByText, getByDisplayValue } = render(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );

    fireEvent.click(getByPlaceholderText(/select task/i));
    fireEvent.click(await waitFor(() => getByText(/task-1/i)));
    fireEvent.click(getByPlaceholderText(/select serviceaccount/i));
    fireEvent.click(await waitFor(() => getByText(/service-account-1/i)));
    // Change selected namespace to the same namespace (expect no change)
    fireEvent.click(getByDisplayValue(/namespace-1/i));
    fireEvent.click(await waitFor(() => getByText(/namespace-1/i)));

    expect(getByDisplayValue(/task-1/i)).toBeTruthy();
    expect(getByDisplayValue(/service-account-1/i)).toBeTruthy();
    // Change selected namespace
    fireEvent.click(getByDisplayValue(/namespace-1/i));
    fireEvent.click(await waitFor(() => getByText(/namespace-2/i)));

    // Verify that Task and ServiceAccount value have reset
    expect(getByPlaceholderText(/select task/i)).toBeTruthy();
    expect(getByPlaceholderText(/select serviceaccount/i)).toBeTruthy();
  });

  it('handles onClose event', () => {
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'namespace-1' }));
    jest.spyOn(props.history, 'push');
    const { getByText } = render(
      <Provider store={store.getStore()}>
        <CreateTaskRun {...props} />
      </Provider>
    );
    fireEvent.click(getByText(/cancel/i));
    expect(props.history.push).toHaveBeenCalledTimes(1);
  });

  it('handles error getting task controlled', () => {
    const badTaskRef = 'task-thisDoesNotExist';
    const { getByPlaceholderText, queryByText } = render(
      <Provider store={store.getStore()}>
        <CreateTaskRun
          {...props}
          location={{ search: `?taskName=${badTaskRef}` }}
        />
      </Provider>
    );

    expect(queryByText(badTaskRef)).toBeFalsy();
    expect(getByPlaceholderText(/select task/i)).toBeTruthy();
  });
});
