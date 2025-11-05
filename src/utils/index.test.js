/*
Copyright 2019-2025 The Tekton Authors
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
import {
  fetchLogs,
  fetchLogsFallback,
  getLocale,
  getLogsRetriever,
  getTheme,
  getViewChangeHandler,
  I18N_DEV_KEY,
  keyBy,
  setTheme,
  sortRunsByCreationTime,
  sortRunsByStartTime
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

describe('sortRunsByCreationTime', () => {
  it('should handle missing creation time or metadata', () => {
    const a = { name: 'a', metadata: { creationTimestamp: '0' } };
    const b = { name: 'b', metadata: {} };
    const c = { name: 'c', metadata: { creationTimestamp: '2' } };
    const d = { name: 'd', metadata: { creationTimestamp: '1' } };
    const e = { name: 'e', metadata: {} };
    const f = { name: 'f', metadata: { creationTimestamp: '3' } };
    const g = { name: 'g' };

    const runs = [a, b, c, d, e, f, g];
    /*
      sort is stable on all modern browsers so
      input order is preserved for b and e
     */
    const sortedRuns = [b, e, g, f, c, d, a];
    sortRunsByCreationTime(runs);
    expect(runs).toEqual(sortedRuns);
  });

  it('should leave the order unchanged if no creationTimestamps specified', () => {
    const a = { name: 'a' };
    const b = { name: 'b' };
    const runs = [a, b];
    const sortedRuns = [a, b];
    sortRunsByCreationTime(runs);
    expect(runs).toEqual(sortedRuns);
  });
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
    vi.spyOn(API, 'getPodLog').mockImplementation(() => logs);

    const returnedLogs = fetchLogs({ stepName, stepStatus, taskRun });
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
    vi.spyOn(API, 'getPodLog');

    fetchLogs({ stepName, stepStatus, taskRun });
    expect(API.getPodLog).not.toHaveBeenCalled();
  });

  it('should return the streamed pod logs', () => {
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
    vi.spyOn(API, 'getPodLog').mockImplementation(() => logs);

    const returnedLogs = fetchLogs({
      stepName,
      stream: true,
      stepStatus,
      taskRun
    });
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
    vi.spyOn(API, 'getPodLog');

    fetchLogs({ stepName, stream: true, stepStatus, taskRun });
    expect(API.getPodLog).not.toHaveBeenCalled();
  });
});

describe('fetchLogsFallback', () => {
  it('should return undefined when no external log provider configured', () => {
    expect(fetchLogsFallback()).toBeUndefined();
  });

  it('should return a function to retrieve logs from the external provider', () => {
    const container = 'fake_container';
    const externalLogsURL = '/fake_url';
    const namespace = 'fake_namespace';
    const podName = 'fake_podName';
    const stepName = 'fake_stepName';
    const startTime = '2000-01-02T03:04:05Z';
    const completionTime = '2006-07-08T09:10:11Z';
    const stepStatus = { container };
    const taskRun = {
      metadata: { namespace },
      status: { podName, startTime, completionTime }
    };
    vi.spyOn(comms, 'get').mockImplementation(() => {});

    const fallback = fetchLogsFallback(externalLogsURL);
    fallback({ stepName, stepStatus, taskRun });
    expect(comms.get).toHaveBeenCalledWith(
      `http://localhost:3000${externalLogsURL}/${namespace}/${podName}/${container}?startTime=${startTime.replaceAll(
        ':',
        '%3A'
      )}&completionTime=${completionTime.replaceAll(':', '%3A')}`,
      { Accept: 'text/plain' }
    );
  });

  it('should handle a missing startTime and completionTime', () => {
    const container = 'fake_container';
    const externalLogsURL = '/fake_url';
    const namespace = 'fake_namespace';
    const podName = 'fake_podName';
    const stepName = 'fake_stepName';
    const stepStatus = { container };
    const taskRun = { metadata: { namespace }, status: { podName } };
    vi.spyOn(comms, 'get').mockImplementation(() => {});

    const fallback = fetchLogsFallback(externalLogsURL);
    fallback({ stepName, stepStatus, taskRun });
    expect(comms.get).toHaveBeenCalledWith(
      `http://localhost:3000${externalLogsURL}/${namespace}/${podName}/${container}`,
      { Accept: 'text/plain' }
    );
  });
});

describe('getLogsRetriever', () => {
  const namespace = 'fake_namespace';
  const podName = 'fake_podName';
  const stepName = 'fake_stepName';
  const stepStatus = { container: stepName };
  const taskRun = { metadata: { namespace }, status: { podName } };

  it('should handle default logs retriever', () => {
    vi.spyOn(API, 'getPodLog').mockImplementation(() => {});
    const logsRetriever = getLogsRetriever({});
    expect(logsRetriever).toBeDefined();
    logsRetriever({ stepName, stepStatus, taskRun });
    expect(API.getPodLog).toHaveBeenCalledWith({
      container: stepName,
      name: podName,
      namespace
    });
  });

  it('should handle default logs retriever with external fallback enabled', async () => {
    const externalLogsURL = 'fake_externalLogsURL';
    vi.spyOn(API, 'getPodLog').mockImplementation(() => {});
    const onFallback = vi.fn();
    const logsRetriever = getLogsRetriever({ externalLogsURL, onFallback });
    expect(logsRetriever).toBeDefined();
    await logsRetriever({ stepName, stepStatus, taskRun });
    expect(API.getPodLog).toHaveBeenCalledWith({
      container: stepName,
      name: podName,
      namespace
    });
    expect(onFallback).not.toHaveBeenCalled();
  });

  it('should handle external logs fallback', async () => {
    const externalLogsURL = 'fake_externalLogsURL';
    vi.spyOn(API, 'getExternalLogURL');
    vi.spyOn(API, 'getPodLog').mockImplementation(() => {
      throw new Error();
    });
    vi.spyOn(comms, 'get').mockImplementation(() => {});
    const onFallback = vi.fn();
    const logsRetriever = getLogsRetriever({ externalLogsURL, onFallback });
    expect(logsRetriever).toBeDefined();
    await logsRetriever({ stepName, stepStatus, taskRun });
    expect(API.getPodLog).toHaveBeenCalledWith({
      container: stepName,
      name: podName,
      namespace
    });
    expect(API.getExternalLogURL).toHaveBeenCalled();
    expect(onFallback).toHaveBeenCalledWith(true);
  });
});

it('getViewChangeHandler', () => {
  const url = 'someURL';
  const navigate = vi.fn();
  const location = { pathname: url, search: '?nonViewQueryParam=someValue' };
  const handleViewChange = getViewChangeHandler({ location, navigate });
  const view = 'someView';
  handleViewChange(view);
  expect(navigate).toHaveBeenCalledWith(
    `${url}?nonViewQueryParam=someValue&view=${view}`
  );
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
    localStorage.setItem(I18N_DEV_KEY, true);
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
    localStorage.removeItem(I18N_DEV_KEY);
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

describe('keyBy', () => {
  it('handles null array', () => {
    expect(keyBy(null)).toEqual({});
  });

  it('handles empty array', () => {
    expect(keyBy([])).toEqual({});
  });

  it('handles array', () => {
    const array = [
      { name: 'a', value: '123' },
      { name: 'b', value: 'xyz' }
    ];
    const key = 'name';
    expect(keyBy(array, key)).toEqual({ a: array[0], b: array[1] });
  });

  it('handles nested field', () => {
    const array = [
      { name: { first: 'John', last: 'Smith' } },
      { name: { first: 'Jane', last: 'Doe' } }
    ];
    const key = 'name.first';
    expect(keyBy(array, key)).toEqual({ John: array[0], Jane: array[1] });
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
