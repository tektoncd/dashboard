/*
Copyright 2019-2020 The Tekton Authors
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

import * as API from '../api';

import {
  fetchLogs,
  followLogs,
  getLogDownloadButton,
  getViewChangeHandler,
  isStale,
  sortRunsByStartTime,
  typeToPlural
} from '.';

describe('sortRunsByStartTime', () => {
  it('should handle missing start time or status', () => {
    const a = { name: 'a', status: { startTime: '0' } };
    const b = { name: 'b', status: {} };
    const c = { name: 'c', status: { startTime: '2' } };
    const d = { name: 'd', status: { startTime: '1' } };
    const e = { name: 'e', status: {} };
    const f = { name: 'f', status: { startTime: '3' } };
    const g = { name: 'g' };

    const runs = [a, b, c, d, e, f, g];
    /*
      sort is stable on all modern browsers so
      input order is preserved for b and e
     */
    const sortedRuns = [b, e, g, f, c, d, a];
    sortRunsByStartTime(runs);
    expect(runs).toEqual(sortedRuns);
  });

  it('should leave the order unchanged if no startTimes specified', () => {
    const a = { name: 'a' };
    const b = { name: 'b' };
    const runs = [a, b];
    const sortedRuns = [a, b];
    sortRunsByStartTime(runs);
    expect(runs).toEqual(sortedRuns);
  });
});

it('typeToPlural', () => {
  expect(typeToPlural('Extension')).toEqual('EXTENSIONS');
});

it('isStale', () => {
  const uid = 'fake_uid';
  const existingResource = {
    metadata: {
      uid,
      resourceVersion: '123'
    }
  };
  const incomingResource = {
    metadata: {
      uid,
      resourceVersion: '45'
    }
  };
  const state = {
    [uid]: existingResource
  };
  expect(isStale(incomingResource, {})).toBe(false);
  expect(isStale(incomingResource, state)).toBe(true);
  expect(isStale(existingResource, state)).toBe(false);
});

describe('fetchLogs', () => {
  it('should return the pod logs', () => {
    const namespace = 'default';
    const podName = 'pipeline-run-123456';
    const stepName = 'kubectl-apply';
    const stepStatus = { container: 'step-kubectl-apply' };
    const taskRun = {
      metadata: { namespace },
      status: { podName }
    };

    const logs = 'fake logs';
    jest.spyOn(API, 'getPodLog').mockImplementation(() => logs);

    const returnedLogs = fetchLogs(stepName, stepStatus, taskRun);
    expect(API.getPodLog).toHaveBeenCalledWith(
      expect.objectContaining({
        container: stepStatus.container,
        name: podName,
        namespace
      })
    );
    returnedLogs.then(data => {
      expect(data).toBe(logs);
    });
  });

  it('should not call the API when the pod is not specified', () => {
    const stepName = 'kubectl-apply';
    const stepStatus = { container: 'step-kubectl-apply' };
    const taskRun = { metadata: { namespace: 'default' } };
    jest.spyOn(API, 'getPodLog');

    fetchLogs(stepName, stepStatus, taskRun);
    expect(API.getPodLog).not.toHaveBeenCalled();
  });
});

describe('followLogs', () => {
  it('should return the pod logs', () => {
    const namespace = 'default';
    const podName = 'pipeline-run-123456';
    const stepName = 'kubectl-apply';
    const stepStatus = { container: 'step-kubectl-apply' };
    const taskRun = {
      metadata: { namespace },
      status: { podName }
    };

    const logs = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('fake logs'));
      }
    });
    jest.spyOn(API, 'getPodLog').mockImplementation(() => logs);

    const returnedLogs = followLogs(stepName, stepStatus, taskRun);
    expect(API.getPodLog).toHaveBeenCalledWith(
      expect.objectContaining({
        container: stepStatus.container,
        name: podName,
        namespace,
        stream: true
      })
    );
    returnedLogs.then(data => {
      expect(data).toBe(logs);
    });
  });

  it('should not call the API when the pod is not specified', () => {
    const stepName = 'kubectl-apply';
    const stepStatus = { container: 'step-kubectl-apply' };
    const taskRun = { metadata: { namespace: 'default' } };
    jest.spyOn(API, 'getPodLog');

    followLogs(stepName, stepStatus, taskRun);
    expect(API.getPodLog).not.toHaveBeenCalled();
  });
});

it('getViewChangeHandler', () => {
  const url = 'someURL';
  const history = { push: jest.fn() };
  const location = { search: '?nonViewQueryParam=someValue' };
  const match = { url };
  const handleViewChange = getViewChangeHandler({ history, location, match });
  const view = 'someView';
  handleViewChange(view);
  expect(history.push).toHaveBeenCalledWith(
    `${url}?nonViewQueryParam=someValue&view=${view}`
  );
});

it('getLogDownloadButton', () => {
  const container = 'fake_container';
  const namespace = 'fake_namespace';
  const podName = 'fake_podname';
  const stepStatus = { container };
  const taskRun = { metadata: { namespace }, status: { podName } };
  jest.spyOn(API, 'getPodLogURL');

  const logDownloadButton = getLogDownloadButton({ stepStatus, taskRun });

  expect(API.getPodLogURL).toHaveBeenCalledWith({
    container,
    name: podName,
    namespace
  });
  expect(logDownloadButton).toBeTruthy();
});
