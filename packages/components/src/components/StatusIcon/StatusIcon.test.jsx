/*
Copyright 2021-2024 The Tekton Authors
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

import { render } from '@testing-library/react';

import StatusIcon from './StatusIcon';

describe('StatusIcon', () => {
  it('renders title', () => {
    const title = 'fake_title';
    const { queryByText } = render(<StatusIcon title={title} />);

    expect(queryByText(title)).toBeTruthy();
  });

  it('renders success state', () => {
    render(<StatusIcon reason="Completed" status="True" />);
  });

  it('renders success with warning state', () => {
    render(<StatusIcon hasWarning reason="Completed" status="True" />);
  });

  it('renders step success state', () => {
    render(<StatusIcon reason="Completed" status="terminated" />);
  });

  it('renders PipelineRunCancelled state', () => {
    render(<StatusIcon reason="PipelineRunCancelled" status="False" />);
  });

  it('renders Cancelled state', () => {
    render(<StatusIcon reason="Cancelled" status="False" />);
  });

  it('renders TaskRunCancelled state', () => {
    render(<StatusIcon reason="TaskRunCancelled" status="False" />);
  });

  it('renders PipelineRunCouldntCancel state', () => {
    render(<StatusIcon reason="PipelineRunCouldntCancel" status="Unknown" />);
  });

  it('renders Skipped state', () => {
    render(
      <StatusIcon
        reason="Completed"
        status="True"
        terminationReason="Skipped"
      />
    );
  });

  it('renders Custom Task running state', () => {
    render(<StatusIcon isCustomTask status="Unknown" />);
  });

  it('gracefully handles unsupported state', () => {
    render(<StatusIcon reason="???" status="???" />);
  });
});
