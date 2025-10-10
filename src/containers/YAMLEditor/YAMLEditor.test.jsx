/*
Copyright 2022-2025 The Tekton Authors
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
import YAMLEditor from './YAMLEditor';

const submitButton = allByText => allByText('Create')[0];
const cancelButton = allByText => allByText('Cancel')[0];
const pipelineRun = `
      apiVersion: tekton.dev/v1beta1
      kind: PipelineRun
      metadata:
        name: test-pipeline-run-name
        namespace: test-namespace
      spec:
        pipelineSpec:
          tasks:
            - name: hello
              taskSpec:
                steps:
                  - name: echo
                    image: busybox
                    script: |
                      #!/bin/ash
                      echo "Hello World!"
    `;

const pipelineRunWithoutNamespace = `
      apiVersion: tekton.dev/v1beta1
      kind: PipelineRun
      metadata:
        name: test-pipeline-run-name
      spec:
        pipelineSpec:
          tasks:
            - name: hello
              taskSpec:
                steps:
                  - name: echo
                    image: busybox
                    script: |
                      #!/bin/ash
                      echo "Hello World!"
    `;

const pipelineRunIncorrectYaml = `a: b
dddd;a`;

describe('YAMLEditor', () => {
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
  it('handles onClose event', () => {
    const handleClose = vi.fn();
    const { getByText } = renderWithRouter(
      <YAMLEditor handleClose={handleClose} />
    );
    fireEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalled();
  });

  it('handle submit with empty editor', () => {
    const { queryAllByText, getByRole, getByText } = renderWithRouter(
      <YAMLEditor kind="PipelineRun" />
    );
    expect(getByRole('textbox')).toBeTruthy();

    expect(submitButton(queryAllByText)).toBeTruthy();

    fireEvent.click(submitButton(queryAllByText));
    expect(getByText(/Please fix errors, then resubmit/)).toBeTruthy();
    expect(getByText('Editor cannot be empty')).toBeTruthy();
  });

  it('handle submit resource without namespace', () => {
    const { queryAllByText, getByRole, getByText } = renderWithRouter(
      <YAMLEditor kind="PipelineRun" />
    );

    fireEvent.paste(getByRole('textbox'), {
      target: { textContent: pipelineRunWithoutNamespace }
    });

    expect(submitButton(queryAllByText)).toBeTruthy();

    fireEvent.click(submitButton(queryAllByText));
    expect(getByText(/Please fix errors, then resubmit/)).toBeTruthy();
    expect(getByText('Namespace cannot be empty')).toBeTruthy();
  });

  it('handle submit resource incorrect yaml', () => {
    const { queryAllByText, getByRole, getByText } = renderWithRouter(
      <YAMLEditor kind="PipelineRun" />
    );

    fireEvent.paste(getByRole('textbox'), {
      target: { textContent: pipelineRunIncorrectYaml }
    });

    expect(submitButton(queryAllByText)).toBeTruthy();

    fireEvent.click(submitButton(queryAllByText));
    expect(getByText(/Please fix errors, then resubmit/)).toBeTruthy();
    expect(
      getByText(/Implicit map keys need to be followed by map values/)
    ).toBeTruthy();
  });

  it('handle submit', async () => {
    const handleCreate = vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: {} }));
    const { queryAllByText, getByText, getByRole } = renderWithRouter(
      <YAMLEditor kind="PipelineRun" handleCreate={handleCreate} />
    );
    fireEvent.paste(getByRole('textbox'), {
      target: { textContent: pipelineRun }
    });
    await waitFor(() => {
      expect(getByText(/test-namespace/)).toBeTruthy();
    });

    fireEvent.click(submitButton(queryAllByText));

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledTimes(1);
    });
  });

  it('handle submit error', async () => {
    const errorResponseMock = {
      response: { status: 404, text: () => Promise.resolve('Whoops!') }
    };
    const handleCreate = vi
      .fn()
      .mockImplementation(() => Promise.reject(errorResponseMock));
    const { queryAllByText, getByText, getByRole } = renderWithRouter(
      <YAMLEditor kind="PipelineRun" handleCreate={handleCreate} />
    );
    fireEvent.paste(getByRole('textbox'), {
      target: { textContent: pipelineRun }
    });
    await waitFor(() => {
      expect(getByText(/test-namespace/)).toBeTruthy();
    });

    fireEvent.click(submitButton(queryAllByText));

    await waitFor(() => {
      expect(getByText(/Whoops!/)).toBeTruthy();
    });
    await waitFor(() => {
      expect(getByText(/Error creating PipelineRun/)).toBeTruthy();
    });
  });

  it('loading state', () => {
    const loadingMessage = 'wait. test is in progress';
    const { getAllByText, queryAllByText } = renderWithRouter(
      <YAMLEditor kind="PipelineRun" loading loadingMessage={loadingMessage} />
    );
    expect(getAllByText(loadingMessage)).toBeTruthy();
    expect(submitButton(queryAllByText).disabled).toBe(true);
    expect(cancelButton(queryAllByText).disabled).toBe(false);
  });
});
