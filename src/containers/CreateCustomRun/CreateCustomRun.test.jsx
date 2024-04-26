/*
Copyright 2023-2024 The Tekton Authors
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

import CreateCustomRun from './CreateCustomRun';
import * as APIUtils from '../../api/utils';
import * as CustomRunsAPI from '../../api/customRuns';

const submitButton = allByText => allByText('Create')[0];

const customRunRawGenerateName = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'CustomRun',
  metadata: {
    annotations: {},
    generateName: 'test-custom-run-name-',
    labels: {},
    namespace: 'test-namespace'
  },
  spec: {
    customRef: {
      apiVersion: 'example.dev/v1beta1'
    }
  }
};

const expectedCustomRun = `apiVersion: tekton.dev/v1beta1
kind: CustomRun
metadata:
  name: run-1111111111
  namespace: test-namespace
spec:
  customRef:
    apiVersion: ''
    kind: ''`;

const expectedCustomRunOneLine = expectedCustomRun.replace(/\r?\n|\r/g, '');

const findNameRegexp = /name: run-\S+/;

describe('CreateCustomRun yaml mode', () => {
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
    vi.spyOn(CustomRunsAPI, 'createCustomRunRaw').mockImplementation(() =>
      Promise.resolve({ data: {} })
    );
    vi.spyOn(CustomRunsAPI, 'useCustomRun').mockImplementation(() => ({
      data: customRunRawGenerateName
    }));

    const { getByRole, queryAllByText } = renderWithRouter(
      <CreateCustomRun />,
      {
        path: '/customruns/create',
        route: '/customruns/create?mode=yaml&namespace=test-namespace'
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
      expect(getByRole(/textbox/)).toBeTruthy();
    });
    let actual = getByRole(/textbox/).textContent;
    actual = actual.replace(findNameRegexp, 'name: run-1111111111');
    expect(actual.trim()).toEqual(expectedCustomRunOneLine);
  });

  it('handle submit with customrun and namespace', async () => {
    vi.spyOn(CustomRunsAPI, 'createCustomRunRaw').mockImplementation(() =>
      Promise.resolve({ data: {} })
    );
    vi.spyOn(CustomRunsAPI, 'useCustomRun').mockImplementation(() => ({
      data: customRunRawGenerateName
    }));

    const { queryAllByText } = renderWithRouter(<CreateCustomRun />, {
      path: '/customruns/create',
      route:
        '/customruns/create?mode=yaml&customRunName=test-custom-run-name&namespace=test-namespace'
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
      expect(CustomRunsAPI.createCustomRunRaw).toHaveBeenCalledTimes(1);
    });
    expect(CustomRunsAPI.createCustomRunRaw).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'test-namespace',
        payload: customRunRawGenerateName
      })
    );
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalledTimes(2);
    });
  });

  it('handles onClose event', () => {
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: 'namespace-1'
    }));
    vi.spyOn(window.history, 'pushState');
    const { getByText } = renderWithRouter(<CreateCustomRun />);
    fireEvent.click(getByText(/cancel/i));
    // will be called once for render (from test utils) and once on navigation
    expect(window.history.pushState).toHaveBeenCalledTimes(2);
  });
});
