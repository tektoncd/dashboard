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
import { fireEvent } from '@testing-library/react';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render } from '../../utils/test';

import CreatePipelineRun from './CreatePipelineRun';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as PipelineResourcesAPI from '../../api/pipelineResources';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
import * as PipelinesAPI from '../../api/pipelines';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';

const pipelines = [
  {
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
  {
    metadata: {
      name: 'pipeline-2',
      namespace: 'namespace-1',
      uid: 'id-pipeline-2'
    },
    spec: {}
  },
  {
    metadata: {
      name: 'pipeline-3',
      namespace: 'namespace-2',
      uid: 'id-pipeline-3'
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

describe('CreatePipelineRun', () => {
  beforeEach(() => {
    jest
      .spyOn(ServiceAccountsAPI, 'useServiceAccounts')
      .mockImplementation(() => ({ data: [serviceAccount] }));
    jest
      .spyOn(PipelinesAPI, 'usePipelines')
      .mockImplementation(() => ({ data: pipelines }));
    jest
      .spyOn(PipelineResourcesAPI, 'usePipelineResources')
      .mockImplementation(() => ({
        data: [pipelineResource1, pipelineResource2]
      }));
    jest
      .spyOn(PipelineRunsAPI, 'usePipelineRuns')
      .mockImplementation(() => ({ data: [] }));
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: ['namespace-1', 'namespace-2'] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: 'namespace-1' }));
  });

  it('renders labels', () => {
    const {
      getAllByText,
      getByText,
      getByPlaceholderText,
      queryByDisplayValue
    } = render(
      <Provider store={mockStore(testStore)}>
        <CreatePipelineRun {...props} />
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

  it('handles onClose event', () => {
    jest.spyOn(props.history, 'push');
    const { getByText } = render(
      <Provider store={mockStore(testStore)}>
        <CreatePipelineRun {...props} />
      </Provider>
    );
    fireEvent.click(getByText(/cancel/i));
    expect(props.history.push).toHaveBeenCalledTimes(1);
  });

  it('handles close', () => {
    jest.spyOn(props.history, 'push');
    const mockTestStore = mockStore(testStore);
    const { getByText } = render(
      <Provider store={mockTestStore}>
        <CreatePipelineRun {...props} />
      </Provider>
    );

    fireEvent.click(getByText(/cancel/i));
    expect(props.history.push).toHaveBeenCalledTimes(1);
  });
});
