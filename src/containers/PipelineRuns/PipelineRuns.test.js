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
import { Route } from 'react-router-dom';
import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import PipelineRunsContainer from './PipelineRuns';

const namespacesTestStore = {
  namespaces: {
    selected: 'namespace-1',
    byName: {
      'namespace-1': ''
    },
    isFetching: false
  }
};
const pipelinesTestStore = {
  pipelines: {
    byNamespace: {
      'namespace-1': {
        'pipeline-1': 'id-pipeline-1'
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
          resources: [{ name: 'resource-1', type: 'type-1' }],
          params: [
            {
              name: 'param-1',
              description: 'description-1',
              default: 'default-1'
            },
            { name: 'param-2' }
          ]
        }
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
      }
    },
    byId: {
      'id-service-account-1': {
        metadata: {
          name: 'service-account-1',
          namespace: 'namespace-1',
          uid: 'id-service-account-1'
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
        'pipeline-resource-1': 'id-pipeline-resource-1'
      }
    },
    byId: {
      'id-pipeline-resource-1': {
        metadata: { name: 'pipeline-resource-1' },
        spec: { type: 'type-1' }
      }
    },
    isFetching: false
  }
};
const pipelineRunsTestStore = {
  pipelineRuns: {
    isFetching: false,
    byId: {
      'pipelineRunWithTwoLabels-id': {
        status: {
          startTime: '0'
        },
        metadata: {
          name: 'pipelineRunWithTwoLabels',
          namespace: 'namespace-1',
          labels: {
            foo: 'bar',
            baz: 'bam'
          },
          uid: 'pipelineRunWithTwoLabels-id'
        },
        spec: {
          pipelineRef: {
            name: 'pipeline-1'
          }
        }
      },
      'pipelineRunWithSingleLabel-id': {
        status: {
          startTime: '1'
        },
        metadata: {
          name: 'pipelineRunWithSingleLabel',
          namespace: 'namespace-1',
          uid: 'pipelineRunWithSingleLabel-id',
          labels: {
            foo: 'bar'
          }
        },
        spec: {
          pipelineRef: {
            name: 'pipeline-1'
          }
        }
      }
    },
    byNamespace: {
      'namespace-1': {
        pipelineRunWithTwoLabels: 'pipelineRunWithTwoLabels-id',
        pipelineRunWithSingleLabel: 'pipelineRunWithSingleLabel-id'
      }
    }
  }
};
const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  notifications: {},
  ...pipelineResourcesTestStore,
  ...pipelineRunsTestStore,
  ...pipelinesTestStore,
  ...serviceAccountsTestStore
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(API, 'getServiceAccounts').mockImplementation(() => []);
  jest.spyOn(API, 'getPipelines').mockImplementation(() => []);
  jest.spyOn(API, 'getPipelineResources').mockImplementation(() => []);
});

it('PipelineRuns can be filtered on a single label filter', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/pipelineruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/pipelineruns"
        render={props => (
          <PipelineRunsContainer
            {...props}
            match={match}
            error={null}
            loading={false}
            namespace="namespace-1"
            fetchPipelineRuns={() => Promise.resolve()}
            pipelineRuns={pipelineRunsTestStore.pipelineRuns.byId}
          />
        )}
      />
    </Provider>,
    { route: '/pipelineruns' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('pipelineRunWithSingleLabel')).toBeFalsy();
  expect(queryByText('pipelineRunWithTwoLabels')).toBeTruthy();
});

it('PipelineRuns can be filtered on multiple label filters', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: ''
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/pipelineruns"
        render={props => (
          <PipelineRunsContainer
            {...props}
            match={match}
            error={null}
            loading={false}
            namespace="namespace-1"
            fetchPipelineRuns={() => Promise.resolve()}
            pipelineRuns={pipelineRunsTestStore.pipelineRuns.byId}
          />
        )}
      />
    </Provider>,
    { route: '/pipelineruns' }
  );

  const firstFilterValue = 'foo:bar';
  const secondFilterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: firstFilterValue } });
  fireEvent.click(getByText('Add filter'));
  fireEvent.change(filterInputField, { target: { value: secondFilterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(firstFilterValue)).toBeTruthy();
  expect(queryByText(secondFilterValue)).toBeTruthy();
  expect(queryByText('pipelineRunWithSingleLabel')).toBeFalsy();
  expect(queryByText('pipelineRunWithTwoLabels')).toBeTruthy();
});

it('PipelineRuns label filter can be deleted, rendering the correct PipelineRuns', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/pipelineruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/pipelineruns"
        render={props => (
          <PipelineRunsContainer
            {...props}
            match={match}
            error={null}
            loading={false}
            namespace="namespace-1"
            fetchPipelineRuns={() => Promise.resolve()}
            pipelineRuns={pipelineRunsTestStore.pipelineRuns.byId}
          />
        )}
      />
    </Provider>,
    { route: '/pipelineruns' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('pipelineRunWithSingleLabel')).toBeFalsy();
  expect(queryByText('pipelineRunWithTwoLabels')).toBeTruthy();

  fireEvent.click(getByText(filterValue));
  await waitForElement(() => getByText('pipelineRunWithSingleLabel'));
  expect(queryByText(filterValue)).toBeFalsy();

  expect(queryByText('pipelineRunWithSingleLabel')).toBeTruthy();
  expect(queryByText('pipelineRunWithTwoLabels')).toBeTruthy();
});

it('Duplicate label filters are prevented', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/pipelineruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/pipelineruns"
        render={props => (
          <PipelineRunsContainer
            {...props}
            match={match}
            error={null}
            loading={false}
            namespace="namespace-1"
            fetchPipelineRuns={() => Promise.resolve()}
            pipelineRuns={pipelineRunsTestStore.pipelineRuns.byId}
          />
        )}
      />
    </Provider>,
    { route: '/pipelineruns' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(queryByText(filterValue)).toBeTruthy();

  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));
  expect(queryByText(/No duplicate filters allowed/i)).toBeTruthy();
});

it('An invalid filter value is disallowed and reported', async () => {
  const mockTestStore = mockStore(testStore);
  const match = {
    params: {},
    url: '/pipelineruns'
  };

  const { queryByText, getByTestId, getByText } = renderWithRouter(
    <Provider store={mockTestStore}>
      <Route
        path="/pipelineruns"
        render={props => (
          <PipelineRunsContainer
            {...props}
            match={match}
            error={null}
            loading={false}
            namespace="namespace-1"
            fetchPipelineRuns={() => Promise.resolve()}
            pipelineRuns={pipelineRunsTestStore.pipelineRuns.byId}
          />
        )}
      />
    </Provider>,
    { route: '/pipelineruns' }
  );

  const filterValue = 'baz=bam';
  const filterInputField = getByTestId('filter-search-bar');
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.click(getByText('Add filter'));

  expect(
    queryByText(
      /Filters must be of the format labelKey:labelValue and contain accepted label characters/i
    )
  ).toBeTruthy();
});
