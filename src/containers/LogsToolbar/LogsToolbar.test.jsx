/*
Copyright 2020-2025 The Tekton Authors
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

import * as API from '../../api';
import { render } from '../../utils/test';

import LogsToolbarContainer from './LogsToolbar';

describe('getLogsToolbar', () => {
  it('should handle pod logs (default)', () => {
    const container = 'fake_container';
    const namespace = 'fake_namespace';
    const podName = 'fake_podname';
    const stepStatus = { container };
    const taskRun = { metadata: { namespace }, status: { podName } };
    vi.spyOn(API, 'getPodLogURL');
    vi.spyOn(API, 'getExternalLogURL');

    render(<LogsToolbarContainer stepStatus={stepStatus} taskRun={taskRun} />);

    expect(API.getExternalLogURL).not.toHaveBeenCalled();
    expect(API.getPodLogURL).toHaveBeenCalledWith({
      container,
      name: podName,
      namespace
    });
  });

  it('should handle external logs', () => {
    const container = 'fake_container';
    const externalLogsURL = 'fake_externalLogsURL';
    const namespace = 'fake_namespace';
    const podName = 'fake_podname';
    const stepStatus = { container };
    const taskRun = { metadata: { namespace }, status: { podName } };
    vi.spyOn(API, 'getPodLogURL');
    vi.spyOn(API, 'getExternalLogURL');

    render(
      <LogsToolbarContainer
        externalLogsURL={externalLogsURL}
        isUsingExternalLogs
        stepStatus={stepStatus}
        taskRun={taskRun}
      />
    );

    expect(API.getPodLogURL).not.toHaveBeenCalled();
    expect(API.getExternalLogURL).toHaveBeenCalledWith({
      container,
      externalLogsURL,
      namespace,
      podName
    });
  });

  it('should handle missing TaskRun status', () => {
    const container = 'fake_container';
    const namespace = 'fake_namespace';
    const stepStatus = { container };
    const taskRun = { metadata: { namespace } };
    vi.spyOn(API, 'getPodLogURL');
    vi.spyOn(API, 'getExternalLogURL');

    render(<LogsToolbarContainer stepStatus={stepStatus} taskRun={taskRun} />);

    expect(API.getExternalLogURL).not.toHaveBeenCalled();
    expect(API.getPodLogURL).not.toHaveBeenCalled();
  });
});
