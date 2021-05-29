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
import StepStatus from './StepStatus';
import { render } from '../../utils/test';

describe('StepStatus', () => {
  it('renders default content', () => {
    const { queryByText } = render(<StepStatus />);
    expect(queryByText(/Status not available/i)).toBeTruthy();
  });

  it('renders the provided content', () => {
    const container = 'fake_container';
    const imageID = 'fake_imageID';
    const name = 'fake_name';
    const terminated = 'fake_terminated';
    const status = { container, imageID, name, terminated };
    const { queryByText } = render(<StepStatus status={status} />);

    expect(queryByText(new RegExp(container, 'i'))).toBeTruthy();
    expect(queryByText(new RegExp(imageID, 'i'))).toBeTruthy();
    expect(queryByText(new RegExp(name, 'i'))).toBeTruthy();
    expect(queryByText(/terminated/i)).toBeTruthy();
    expect(queryByText(new RegExp(terminated, 'i'))).toBeTruthy();
  });

  it('renders running and waiting when provided', () => {
    const container = 'fake_container';
    const imageID = 'fake_imageID';
    const name = 'fake_name';
    const running = 'fake_running';
    const waiting = 'fake_waiting';
    const status = { container, imageID, name, running, waiting };
    const { queryByText } = render(<StepStatus status={status} />);

    expect(queryByText(new RegExp(container, 'i'))).toBeTruthy();
    expect(queryByText(new RegExp(imageID, 'i'))).toBeTruthy();
    expect(queryByText(new RegExp(name, 'i'))).toBeTruthy();
    expect(queryByText(/terminated/i)).toBeFalsy();
    expect(queryByText(new RegExp(running, 'i'))).toBeTruthy();
    expect(queryByText(new RegExp(waiting, 'i'))).toBeTruthy();
  });
});
