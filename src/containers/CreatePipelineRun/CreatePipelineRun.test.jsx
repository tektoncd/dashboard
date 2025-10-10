/*
Copyright 2019-2024 The Tekton Authors
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

import { renderWithRouter } from '../../utils/test';

import CreatePipelineRun from './CreatePipelineRun';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as PipelineRunsAPI from '../../api/pipelineRuns';
import * as PipelinesAPI from '../../api/pipelines';
import * as ServiceAccountsAPI from '../../api/serviceAccounts';

const submitButton = allByText => allByText('Create')[0];
const pipelines = [
  {
    metadata: {
      name: 'pipeline-1',
      namespace: 'namespace-1',
      uid: 'id-pipeline-1'
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

describe('CreatePipelineRun', () => {
  beforeEach(() => {
    vi.spyOn(ServiceAccountsAPI, 'useServiceAccounts').mockImplementation(
      () => ({ data: [serviceAccount] })
    );
    vi.spyOn(PipelinesAPI, 'usePipelines').mockImplementation(() => ({
      data: pipelines
    }));
    vi.spyOn(PipelineRunsAPI, 'usePipelineRuns').mockImplementation(() => ({
      data: []
    }));
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [
        { metadata: { name: 'namespace-1' } },
        { metadata: { name: 'namespace-2' } }
      ]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: 'namespace-1'
    }));
  });

  it('renders labels', () => {
    const {
      getAllByText,
      getByPlaceholderText,
      getByRole,
      queryByDisplayValue
    } = renderWithRouter(<CreatePipelineRun />);
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

  it('handles onClose event', () => {
    vi.spyOn(window.history, 'pushState');
    const { getByText } = renderWithRouter(<CreatePipelineRun />);
    fireEvent.click(getByText(/cancel/i));
    // will be called once for render (from test utils) and once for navigation
    expect(window.history.pushState).toHaveBeenCalledTimes(2);
  });

  it('handles close', () => {
    vi.spyOn(window.history, 'pushState');
    const { getByText } = renderWithRouter(<CreatePipelineRun />);
    fireEvent.click(getByText(/cancel/i));
    expect(window.history.pushState).toHaveBeenCalledTimes(2);
  });
});

const pipelineRunRawGenerateName = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'PipelineRun',
  metadata: {
    annotations: {},
    generateName: 'test-pipeline-run-name-',
    labels: {},
    namespace: 'test-namespace'
  },
  spec: {
    pipelineSpec: {
      tasks: [
        {
          name: 'hello',
          taskSpec: {
            steps: [
              {
                image: 'busybox',
                name: 'echo',
                script: '#!/bin/ash\necho "Hello World!"\n'
              }
            ]
          }
        }
      ]
    }
  }
};

const expectedPipelineRun = `apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: run-1111111111
  namespace: test-namespace
  labels: {}
spec:
  pipelineRef:
    name: ''
  status: ''`;
const expectedPipelineRunOneLine = expectedPipelineRun.replace(/\r?\n|\r/g, '');
const findNameRegexp = /name: run-\S+/;
describe('CreatePipelineRun yaml mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.history, 'pushState');

    // Workaround for codemirror vs jsdom https://github.com/jsdom/jsdom/issues/3002#issuecomment-1118039915
    // for textRange(...).getClientRects is not a function
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    });
    Range.prototype.getClientRects = () => ({
      item: () => null,
      length: 0,
      [Symbol.iterator]: vi.fn()
    });
  });

  it('renders with namespace', async () => {
    vi.spyOn(PipelineRunsAPI, 'createPipelineRunRaw').mockImplementation(() =>
      Promise.resolve({ data: {} })
    );
    vi.spyOn(PipelineRunsAPI, 'usePipelineRun').mockImplementation(() => ({
      data: pipelineRunRawGenerateName
    }));

    const { getByRole, queryAllByText } = renderWithRouter(
      <CreatePipelineRun />,
      {
        path: '/pipelineruns/create',
        route: '/pipelineruns/create?mode=yaml&namespace=test-namespace'
      }
    );

    await waitFor(
      () => {
        expect(queryAllByText(/Loading/).length).toBe(0);
      },
      {
        timeout: 3000
      }
    );
    await waitFor(() => {
      expect(getByRole('textbox')).toBeTruthy();
    });
    let actual = getByRole('textbox').textContent;
    actual = actual.replace(findNameRegexp, 'name: run-1111111111');
    expect(actual.trim()).toEqual(expectedPipelineRunOneLine);
  });

  it('handle submit with pipelinerun and namespace', async () => {
    vi.spyOn(PipelineRunsAPI, 'createPipelineRunRaw').mockImplementation(() =>
      Promise.resolve({ data: {} })
    );
    vi.spyOn(PipelineRunsAPI, 'usePipelineRun').mockImplementation(() => ({
      data: pipelineRunRawGenerateName
    }));

    const { queryAllByText } = renderWithRouter(<CreatePipelineRun />, {
      path: '/pipelineruns/create',
      route:
        '/pipelineruns/create?mode=yaml&pipelineRunName=test-pipeline-run-name&namespace=test-namespace'
    });

    await waitFor(
      () => {
        expect(queryAllByText(/Loading/).length).toBe(0);
      },
      { timeout: 3000 }
    );
    expect(submitButton(queryAllByText)).toBeTruthy();

    fireEvent.click(submitButton(queryAllByText));

    await waitFor(() => {
      expect(PipelineRunsAPI.createPipelineRunRaw).toHaveBeenCalledTimes(1);
    });
    expect(PipelineRunsAPI.createPipelineRunRaw).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'test-namespace',
        payload: pipelineRunRawGenerateName
      })
    );
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalledTimes(2);
    });
  });
});
