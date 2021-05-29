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
import Step from './Step';
import { render } from '../../utils/test';

it('Step renders default content', () => {
  const { queryByText } = render(<Step />);

  expect(queryByText(/Unknown/i)).toBeTruthy();
});

it('Step renders the provided content', () => {
  const stepName = 'build';
  const { queryByText } = render(<Step stepName={stepName} />);
  expect(queryByText(/build/i)).toBeTruthy();
});

it('Step renders selected state', () => {
  render(<Step selected />);
});

it('Step renders waiting state', () => {
  const { queryByText } = render(<Step status="waiting" />);
  expect(queryByText(/waiting/i)).toBeTruthy();
});

it('Step renders running state', () => {
  const { queryByText } = render(<Step status="running" />);
  expect(queryByText(/running/i)).toBeTruthy();
});

it('Step renders cancelled state', () => {
  const { queryByText } = render(<Step status="cancelled" />);
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('Step renders cancelled state for TaskRunCancelled', () => {
  const { queryByText } = render(
    <Step status="terminated" reason="TaskRunCancelled" />
  );
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('Step renders cancelled state for TaskRunTimeout', () => {
  const { queryByText } = render(
    <Step status="terminated" reason="TaskRunTimeout" />
  );
  expect(queryByText(/Cancelled/i)).toBeTruthy();
});

it('Step renders completed state', () => {
  const { queryByText } = render(
    <Step status="terminated" reason="Completed" />
  );
  expect(queryByText(/Completed/i)).toBeTruthy();
});

it('Step renders error state', () => {
  const { queryByText } = render(<Step status="terminated" reason="Error" />);
  expect(queryByText(/Failed/i)).toBeTruthy();
});

it('Step handles click event', () => {
  const onSelect = jest.fn();
  const { getByText } = render(<Step stepName="build" onSelect={onSelect} />);
  fireEvent.click(getByText(/build/i));
  expect(onSelect).toHaveBeenCalledTimes(1);
});
