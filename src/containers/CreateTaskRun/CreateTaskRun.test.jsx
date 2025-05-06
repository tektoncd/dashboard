/*
Copyright 2019-2025 The Tekton Authors
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

import { fireEvent, waitFor } from '@testing-library/react';

import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '../../utils/test';

import CreateTaskRun from './CreateTaskRun';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';
import * as TasksAPI from '../../api/tasks';

const tasks = [
  {
    metadata: {
      name: 'task-1',
      namespace: 'namespace-1',
      uid: 'id-task-1'
    },
    spec: {
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

const serviceAccount = {
  metadata: {
    name: 'service-account-1',
    namespace: 'namespace-1',
    uid: 'id-service-account-1'
  }
};

const submitButton = allByText => allByText('Create')[0];

describe('CreateTaskRun', () => {
  beforeEach(() => {
    vi.spyOn(ServiceAccountsAPI, 'useServiceAccounts').mockImplementation(
      () => ({ data: [serviceAccount] })
    );
    vi.spyOn(TasksAPI, 'useTasks').mockImplementation(() => ({ data: tasks }));

    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [
        { metadata: { name: 'namespace-1' } },
        { metadata: { name: 'namespace-2' } }
      ]
    }));
  });

  it('renders empty, dropdowns disabled when no namespace selected', async () => {
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: ALL_NAMESPACES
    }));
    const {
      getByPlaceholderText,
      getByText,
      queryByText,
      queryAllByText,
      queryByPlaceholderText
    } = renderWithRouter(<CreateTaskRun />, {
      path: '/taskruns/create',
      route: '/taskruns/create?kind=Task'
    });
    expect(queryByText(/create taskrun/i)).toBeTruthy();
    expect(queryByPlaceholderText(/select namespace/i)).toBeTruthy();
    expect(queryByPlaceholderText(/select task/i).disabled).toBeTruthy();
    expect(
      queryByPlaceholderText(/select serviceaccount/i).disabled
    ).toBeTruthy();
    expect(queryByText(/cancel/i)).toBeTruthy();
    expect(submitButton(queryAllByText)).toBeTruthy();

    // Check dropdowns enabled when namespace selected
    fireEvent.click(
      await waitFor(() => getByPlaceholderText(/select namespace/i))
    );
    fireEvent.click(await waitFor(() => getByText(/namespace-1/i)));
    await waitFor(() =>
      expect(getByPlaceholderText(/select task/i).disabled).toBe(false)
    );
    await waitFor(() =>
      expect(getByPlaceholderText(/select serviceaccount/i).disabled).toBe(
        false
      )
    );
  });

  it('renders labels', () => {
    const {
      getAllByText,
      getByPlaceholderText,
      getByRole,
      queryByDisplayValue
    } = renderWithRouter(<CreateTaskRun />);
    fireEvent.click(getAllByText(/Add/i)[0]);
    fireEvent.change(getByPlaceholderText(/key/i), {
      target: { value: 'foo' }
    });
    fireEvent.change(getByPlaceholderText(/value/i), {
      target: { value: 'bar' }
    });
    expect(queryByDisplayValue(/foo/i)).toBeTruthy();
    expect(queryByDisplayValue(/bar/i)).toBeTruthy();
    fireEvent.click(getByRole('button', { name: 'Remove' }));
    expect(queryByDisplayValue(/foo/i)).toBeFalsy();
    expect(queryByDisplayValue(/bar/i)).toBeFalsy();
  });

  it('resets Task and ServiceAccount when namespace changes', async () => {
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: 'namespace-1'
    }));

    const { getByPlaceholderText, getByText, getByDisplayValue } =
      renderWithRouter(<CreateTaskRun />);

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
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: 'namespace-1'
    }));
    vi.spyOn(window.history, 'pushState');
    const { getByText } = renderWithRouter(<CreateTaskRun />);
    fireEvent.click(getByText(/cancel/i));
    // will be called once for render (from test utils) and once on navigation
    expect(window.history.pushState).toHaveBeenCalledTimes(2);
  });

  it('handles error getting task controlled', () => {
    const badTaskRef = 'task-thisDoesNotExist';
    const { getByPlaceholderText, queryByText } = renderWithRouter(
      <CreateTaskRun />,
      {
        path: '/taskruns/create',
        route: `/taskruns/create?taskName=${badTaskRef}`
      }
    );

    expect(queryByText(badTaskRef)).toBeFalsy();
    expect(getByPlaceholderText(/select task/i)).toBeTruthy();
  });
});
