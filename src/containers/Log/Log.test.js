/*
Copyright 2019 The Tekton Authors
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
import { waitForElement } from 'react-testing-library';

import LogContainer from './Log';
import * as API from '../../api';
import { renderWithRouter } from '../../utils/test';

beforeEach(jest.resetAllMocks);

it('LogContainer renders', async () => {
  const namespace = 'namespace';
  const stepName = 'step';
  const podName = 'taskRun';
  const logs = 'loads of logs';
  const getPodLog = jest.spyOn(API, 'getPodLog').mockImplementation(() => logs);

  const { getByText } = renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={podName}
      stepName={stepName}
      stepStatus={{}}
    />
  );
  await waitForElement(() => getByText(logs));

  expect(getPodLog).toHaveBeenCalledTimes(1);
  expect(getPodLog).toHaveBeenCalledWith({
    container: `step-${stepName}`,
    name: podName,
    namespace
  });

  const anotherPodName = 'anotherPod';
  renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={anotherPodName}
      stepName={stepName}
      stepStatus={{}}
    />
  );
  expect(getPodLog).toHaveBeenCalledTimes(2);
  expect(getPodLog).toHaveBeenCalledWith({
    container: `step-${stepName}`,
    name: anotherPodName,
    namespace
  });
});

it('LogContainer renders with container name from step status', async () => {
  const container = 'containerName';
  const namespace = 'namespace';
  const podName = 'taskRun';
  const logs = 'loads of logs';
  const getPodLog = jest.spyOn(API, 'getPodLog').mockImplementation(() => logs);

  const { getByText } = renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={podName}
      stepStatus={{ container }}
    />
  );
  await waitForElement(() => getByText(logs));

  expect(getPodLog).toHaveBeenCalledTimes(1);
  expect(getPodLog).toHaveBeenCalledWith({
    container,
    name: podName,
    namespace
  });

  const anotherContainerName = 'anotherContainerName';
  renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={podName}
      stepStatus={{ container: anotherContainerName }}
    />
  );
  expect(getPodLog).toHaveBeenCalledTimes(2);
  expect(getPodLog).toHaveBeenCalledWith({
    container: anotherContainerName,
    name: podName,
    namespace
  });
});

it('LogContainer handles error case', async () => {
  const namespace = 'namespace';
  const stepName = 'step';
  const podName = 'pod';
  const getPodLog = jest.spyOn(API, 'getPodLog').mockImplementation(() => {
    throw new Error();
  });

  const { getByText } = renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={podName}
      stepName={stepName}
      stepStatus={{}}
    />
  );
  await waitForElement(() => getByText('Unable to fetch log'));

  expect(getPodLog).toHaveBeenCalledTimes(1);
  expect(getPodLog).toHaveBeenCalledWith({
    container: `step-${stepName}`,
    name: podName,
    namespace
  });
});

it('LogContainer handles empty logs', async () => {
  const namespace = 'namespace';
  const stepName = 'step';
  const podName = 'taskRun';
  const getPodLog = jest.spyOn(API, 'getPodLog').mockImplementation(() => '');

  renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={podName}
      stepName={stepName}
      stepStatus={{}}
    />
  );

  expect(getPodLog).toHaveBeenCalledTimes(1);
  expect(getPodLog).toHaveBeenCalledWith({
    container: `step-${stepName}`,
    name: podName,
    namespace
  });
});

it('LogContainer handles missing step logs', async () => {
  const namespace = 'namespace';
  const stepName = 'step';
  const podName = 'pod';
  const getPodLog = jest
    .spyOn(API, 'getPodLog')
    .mockImplementation(() => undefined);

  const { getByText } = renderWithRouter(
    <LogContainer
      match={{ params: { namespace } }}
      namespace={namespace}
      podName={podName}
      stepName={stepName}
      stepStatus={{}}
    />
  );
  await waitForElement(() => getByText('No log available'));

  expect(getPodLog).toHaveBeenCalledTimes(1);
  expect(getPodLog).toHaveBeenCalledWith({
    container: `step-${stepName}`,
    name: podName,
    namespace
  });
});
