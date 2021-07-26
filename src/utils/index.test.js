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

import * as API from '../api';
import * as comms from '../api/comms';
import config from '../../config_frontend/config.json';

import {
  fetchLogs,
  fetchLogsFallback,
  followLogs,
  getLocale,
  getLogsToolbar,
  getTheme,
  getViewChangeHandler,
  isStale,
  setTheme,
  sortRunsByStartTime,
  typeToPlural
} from '.';

const { locales: localesConfig } = config;

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

describe('fetchLogsFallback', () => {
  it('should return undefined when no external log provider configured', () => {
    expect(fetchLogsFallback()).toBeUndefined();
  });

  it('should return a function to retrieve logs from the external provider', () => {
    const container = 'fake_container';
    const externalLogsURL = 'fake_url';
    const namespace = 'fake_namespace';
    const podName = 'fake_podName';
    const stepName = 'fake_stepName';
    const stepStatus = { container };
    const taskRun = { metadata: { namespace }, status: { podName } };
    jest.spyOn(comms, 'get');

    const fallback = fetchLogsFallback(externalLogsURL);
    fallback(stepName, stepStatus, taskRun);
    expect(
      comms.get
    ).toHaveBeenCalledWith(
      `${externalLogsURL}/${namespace}/${podName}/${container}`,
      { Accept: 'text/plain' }
    );
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

    const logs = {
      getReader() {
        return {
          read() {
            return Promise.resolve({
              done: true,
              value: new TextEncoder().encode('fake logs')
            });
          }
        };
      }
    };
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

it('getLogsToolbar', () => {
  const container = 'fake_container';
  const namespace = 'fake_namespace';
  const podName = 'fake_podname';
  const stepStatus = { container };
  const taskRun = { metadata: { namespace }, status: { podName } };
  jest.spyOn(API, 'getPodLogURL');

  const logsToolbar = getLogsToolbar({ stepStatus, taskRun });

  expect(API.getPodLogURL).toHaveBeenCalledWith({
    container,
    name: podName,
    namespace
  });
  expect(logsToolbar).toBeTruthy();
});

describe('getLocale', () => {
  it('handles exact matches for supported locales', () => {
    const locale = 'en';
    expect(getLocale(locale)).toEqual(locale);
  });

  it('handles fallback matches for supported locales', () => {
    expect(getLocale('en-US')).toEqual('en');
  });

  it('handles Chinese locales', () => {
    localStorage.setItem(localesConfig.devOverrideKey, true);
    const locales = {
      zh: 'zh-Hans',
      'zh-CN': 'zh-Hans',
      'zh-Hans': 'zh-Hans',
      'zh-Hant': 'zh-Hant',
      'zh-HA': 'zh-Hant',
      'zh-HK': 'zh-Hant',
      'zh-MO': 'zh-Hant',
      'zh-SG': 'zh-Hans',
      'zh-TW': 'zh-Hant'
    };

    Object.keys(locales).forEach(locale => {
      expect(getLocale(locale)).toEqual(locales[locale]);
    });
    localStorage.removeItem(localesConfig.devOverrideKey);
  });

  it('handles unsupported locales', () => {
    expect(getLocale('zz')).toEqual('en');
  });
});

describe('getTheme', () => {
  afterEach(() => {
    localStorage.removeItem('tkn-theme');
  });

  it('defaults to system if no theme persisted', () => {
    localStorage.removeItem('tkn-theme');
    const theme = getTheme();
    expect(theme).toEqual('system');
  });

  it('defaults to system if an invalid theme was persisted', () => {
    localStorage.setItem('tkn-theme', 'foo');
    const theme = getTheme();
    expect(theme).toEqual('system');
  });

  it('returns a valid persisted theme', () => {
    localStorage.setItem('tkn-theme', 'light');
    const theme = getTheme();
    expect(theme).toEqual('light');
  });
});

describe('setTheme', () => {
  it('defaults to system if no theme specified', () => {
    localStorage.removeItem('tkn-theme');
    setTheme();
    expect(localStorage.getItem('tkn-theme')).toEqual('system');
  });

  it('defaults to system if an invalid theme is specified', () => {
    localStorage.removeItem('tkn-theme');
    setTheme('foo');
    expect(localStorage.getItem('tkn-theme')).toEqual('system');
  });

  it('persists a valid theme', () => {
    localStorage.removeItem('tkn-theme');
    setTheme('light');
    expect(localStorage.getItem('tkn-theme')).toEqual('light');
  });
});
