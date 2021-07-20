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
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import * as PipelinesAPI from '../../api/pipelines';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
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
const pipelines = [
  {
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
];

const pipelineRuns = [
  {
    status: {
      startTime: '0',
      conditions: [{ reason: 'Completed', status: 'True', type: 'Succeeded' }]
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
  {
    status: {
      startTime: '1',
      conditions: [{ reason: 'Completed', status: 'True', type: 'Succeeded' }]
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
  },
  {
    metadata: {
      name: 'pipelineRunPending',
      namespace: 'namespace-1',
      uid: 'pipelineRunPending-id',
      labels: {
        foo: 'bar'
      }
    },
    spec: {
      pipelineRef: {
        name: 'pipeline-1'
      },
      status: 'PipelineRunPending'
    }
  }
];

const middleware = [thunk];
const mockStore = configureStore(middleware);
const testStore = {
  ...namespacesTestStore,
  notifications: {}
};

describe('PipelineRuns container', () => {
  beforeEach(() => {
    jest
      .spyOn(PipelinesAPI, 'usePipelines')
      .mockImplementation(() => ({ data: pipelines }));
    jest
      .spyOn(PipelineRunsAPI, 'usePipelineRuns')
      .mockImplementation(() => ({ data: [...pipelineRuns] }));
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);
  });

  it('Duplicate label filters are prevented', async () => {
    const mockTestStore = mockStore(testStore);
    const match = {
      params: {},
      url: '/pipelineruns'
    };

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
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
            />
          )}
        />
      </Provider>,
      { route: '/pipelineruns' }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
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

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
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
            />
          )}
        />
      </Provider>,
      { route: '/pipelineruns' }
    );

    const filterValue = 'baz=bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(
      queryByText(
        /Filters must be of the format labelKey:labelValue and contain accepted label characters/i
      )
    ).toBeTruthy();
  });

  it('Creation, deletion and stop events are possible when not in read-only mode', async () => {
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);

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
            />
          )}
        />
      </Provider>,
      { route: '/pipelineruns' }
    );

    // Let the page finish rendering so we know if we're in read-only mode or not
    await waitFor(() => getByText('pipelineRunWithTwoLabels'));
    expect(queryAllByText('Create')[0]).toBeTruthy(); // So we don't match on "Created" which is a table header
    expect(getAllByTitle(/actions/i)[0]).toBeTruthy();
  });

  it('Creation, deletion and stop events are not possible when in read-only mode', async () => {
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => true);

    const mockTestStore = mockStore(testStore);
    const match = {
      params: {},
      url: '/pipelineruns'
    };

    const {
      getByText,
      queryAllByLabelText,
      queryAllByText,
      queryAllByTitle
    } = renderWithRouter(
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
            />
          )}
        />
      </Provider>,
      { route: '/pipelineruns' }
    );
    // Let the page finish rendering so we know if we're in read-only mode or not
    await waitFor(() => getByText('pipelineRunWithTwoLabels'));
    expect(queryAllByText('Create')[0]).toBeFalsy();
    expect(queryAllByTitle(/actions/i)[0]).toBeFalsy();
    expect(queryAllByLabelText('Select row').length).toBe(0);
  });

  it('handles rerun event in PipelineRuns page', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);
    PipelineRunsAPI.usePipelineRuns.mockImplementation(() => ({
      data: [pipelineRuns[0]]
    }));
    jest
      .spyOn(PipelineRunsAPI, 'rerunPipelineRun')
      .mockImplementation(() => []);
    const { getAllByTitle, getByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={urls.pipelineRuns.all()}
          render={props => <PipelineRunsContainer {...props} />}
        />
      </Provider>,
      { route: urls.pipelineRuns.all() }
    );
    await waitFor(() => getByText(/pipelineRunWithTwoLabels/i));
    fireEvent.click(await waitFor(() => getAllByTitle('Actions')[0]));
    await waitFor(() => getByText(/Rerun/i));
    fireEvent.click(getByText('Rerun'));
    expect(PipelineRunsAPI.rerunPipelineRun).toHaveBeenCalledTimes(1);
    expect(PipelineRunsAPI.rerunPipelineRun).toHaveBeenCalledWith(
      pipelineRuns[0]
    );
  });

  it('handles start event in PipelineRuns page', async () => {
    const mockTestStore = mockStore(testStore);
    jest.spyOn(API, 'useIsReadOnly').mockImplementation(() => false);
    jest
      .spyOn(PipelineRunsAPI, 'usePipelineRuns')
      .mockImplementation(() => ({ data: [pipelineRuns[2]] }));
    jest
      .spyOn(PipelineRunsAPI, 'startPipelineRun')
      .mockImplementation(() => []);
    const { getAllByTitle, getByText } = renderWithRouter(
      <Provider store={mockTestStore}>
        <Route
          path={urls.pipelineRuns.all()}
          render={props => <PipelineRunsContainer {...props} />}
        />
      </Provider>,
      { route: urls.pipelineRuns.all() }
    );
    await waitFor(() => getByText(/pipelineRunPending/i));
    fireEvent.click(await waitFor(() => getAllByTitle('Actions')[0]));
    await waitFor(() => getByText(/Start/i));
    fireEvent.click(getByText('Start'));
    expect(PipelineRunsAPI.startPipelineRun).toHaveBeenCalledTimes(1);
    expect(PipelineRunsAPI.startPipelineRun).toHaveBeenCalledWith(
      pipelineRuns[2]
    );
  });
});
