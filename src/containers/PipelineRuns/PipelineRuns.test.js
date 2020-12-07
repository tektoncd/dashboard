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
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import * as PipelineResourcesAPI from '../../api/pipelineResources';
import * as PipelinesAPI from '../../api/pipelines';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';
import * as selectors from '../../reducers';
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
  properties: {},
  ...serviceAccountsTestStore
};

describe('PipelineRuns container', () => {
  beforeEach(() => {
    jest
      .spyOn(ServiceAccountsAPI, 'getServiceAccounts')
      .mockImplementation(() => []);
    jest.spyOn(PipelinesAPI, 'getPipelines').mockImplementation(() => []);
    jest
      .spyOn(PipelineResourcesAPI, 'getPipelineResources')
      .mockImplementation(() => []);
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => true);
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
    fireEvent.submit(getByText(/Input a label filter/i));

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
    fireEvent.submit(getByText(/Input a label filter/i));
    fireEvent.change(filterInputField, {
      target: { value: secondFilterValue }
    });
    fireEvent.submit(getByText(/Input a label filter/i));

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
    fireEvent.submit(getByText(/Input a label filter/i));

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
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();

    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));
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
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(
      queryByText(
        /Filters must be of the format labelKey:labelValue and contain accepted label characters/i
      )
    ).toBeTruthy();
  });

  it('Creation, deletion and stop events are possible when not in read-only mode', async () => {
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => false);

    const mockTestStore = mockStore(testStore);
    const match = {
      params: {},
      url: '/pipelineruns'
    };

    const { getByText, getAllByTitle, queryAllByText } = renderWithRouter(
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

    // Let the page finish rendering so we know if we're in read-only mode or not
    await waitForElement(() => getByText('pipelineRunWithTwoLabels'));
    expect(queryAllByText('Create')[0]).toBeTruthy(); // So we don't match on "Created" which is a table header
    expect(getAllByTitle(/actions/i)[0]).toBeTruthy();
  });

  it('Creation, deletion and stop events are not possible when in read-only mode', async () => {
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => true);

    const mockTestStore = mockStore(testStore);
    const match = {
      params: {},
      url: '/pipelineruns'
    };

    const { getByText, queryAllByText, queryAllByTitle } = renderWithRouter(
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
    // Let the page finish rendering so we know if we're in read-only mode or not
    await waitForElement(() => getByText('pipelineRunWithTwoLabels'));
    expect(queryAllByText('Create')[0]).toBeFalsy();
    expect(queryAllByTitle(/actions/i)[0]).toBeFalsy();
  });

  it('handles rerun event in PipelineRuns page', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(selectors, 'isReadOnly').mockImplementation(() => false);
    jest
      .spyOn(PipelineRunsAPI, 'rerunPipelineRun')
      .mockImplementation(() => []);
    const { getAllByTestId, getByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={urls.pipelineRuns.all()}
          render={props => (
            <PipelineRunsContainer
              {...props}
              fetchPipelineRuns={() => Promise.resolve()}
              pipelineRuns={pipelineRunsTestStore.pipelineRuns.byId}
            />
          )}
        />
      </Provider>,
      { route: urls.pipelineRuns.all() }
    );
    await waitForElement(() => getByText(/pipelineRunWithTwoLabels/i));
    fireEvent.click(
      await waitForElement(() => getAllByTestId('overflowmenu')[0])
    );
    await waitForElement(() => getByText(/Rerun/i));
    fireEvent.click(getByText('Rerun'));
    expect(PipelineRunsAPI.rerunPipelineRun).toHaveBeenCalledTimes(1);
    expect(PipelineRunsAPI.rerunPipelineRun).toHaveBeenCalledWith(
      pipelineRunsTestStore.pipelineRuns.byId['pipelineRunWithSingleLabel-id']
    );
  });
});
