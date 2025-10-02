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

import { getExternalLogURL, getPodLog } from '../api';

import { get } from '../api/comms';

const buildLocales = import.meta.env.VITE_LOCALES_BUILD.split(',');
const supportedLocales = import.meta.env.VITE_LOCALES_SUPPORTED.split(',');

export const defaultLocale = import.meta.env.VITE_LOCALES_DEFAULT;
export const I18N_DEV_KEY = 'tkn-locale-dev';

/**
 * Convert an array of objects to an object keyed by the field specified by `key`.
 * In case multiple elements have the same value for `key`, the last such element
 * overrides previous values.
 *
 * Example:
 * `keyBy([{ title: 'a', value: '123' }, { title: 'xyz', value: '456' }], 'title')`
 *
 * Result:
 * ```
 * {
 *  a: { title: 'a', value: '123' },
 *  xyz: { title: 'xyz', value: '456' }
 * }
 * ```
 */
export function keyBy(array, key) {
  return (array || []).reduce(
    (acc, item) => ({
      ...acc,
      [item[key]]: item
    }),
    {}
  );
}

export function sortRunsByStartTime(runs) {
  runs.sort((a, b) => {
    const aTime = (a.status || {}).startTime;
    const bTime = (b.status || {}).startTime;
    if (!aTime && !bTime) {
      return 0;
    }
    if (!aTime) {
      return -1;
    }
    if (!bTime) {
      return 1;
    }
    return -1 * aTime.localeCompare(bTime);
  });
}

export function sortRunsByCreationTime(runs) {
  runs.sort((a, b) => {
    const aTime = (a.metadata || {}).creationTimestamp;
    const bTime = (b.metadata || {}).creationTimestamp;
    if (!aTime && !bTime) {
      return 0;
    }
    if (!aTime) {
      return -1;
    }
    if (!bTime) {
      return 1;
    }
    return -1 * aTime.localeCompare(bTime);
  });
}

export async function fetchLogs({ _stepName, stream, stepStatus, taskRun }) {
  const { namespace } = taskRun.metadata;
  const { podName } = taskRun.status || {};
  let logs;
  if (podName && stepStatus) {
    const { container } = stepStatus;
    logs = getPodLog({
      container,
      name: podName,
      namespace,
      stream
    });
  }
  return logs;
}

export function fetchLogsFallback(externalLogsURL) {
  if (!externalLogsURL) {
    return undefined;
  }

  return ({ _stepName, stepStatus, taskRun }) => {
    const { namespace } = taskRun.metadata;
    const { podName, startTime, completionTime } = taskRun.status || {};
    const { container } = stepStatus;
    return get(
      getExternalLogURL({
        container,
        externalLogsURL,
        namespace,
        podName,
        startTime,
        completionTime
      }),
      {
        Accept: 'text/plain'
      }
    );
  };
}

export function getLogsRetriever({
  externalLogsURL,
  isLogStreamingEnabled,
  onFallback
}) {
  const fallback = fetchLogsFallback(externalLogsURL);

  if (fallback) {
    return ({ stepName, stepStatus, taskRun }) =>
      fetchLogs({
        stepName,
        stream: isLogStreamingEnabled,
        stepStatus,
        taskRun
      }).catch(() => {
        onFallback(true);
        // TODO: logs - support streaming from external logs?
        return fallback({ stepName, stepStatus, taskRun });
      });
  }

  return fetchLogs;
}

// K8s label documentation comes from here:
// https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
const labelKeyRegex =
  /^(([a-z0-9A-Z]([a-z0-9A-Z-.]*[a-z0-9A-Z])?){0,253}\/)?([a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?){1,63}$/;
const labelValueRegex = /^([a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?){0,63}$/;
export function isValidLabel(type, value) {
  const regex = type === 'key' ? labelKeyRegex : labelValueRegex;
  return regex.test(value);
}

export function getViewChangeHandler({ location, navigate }) {
  return function handleViewChange(view) {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('view', view);
    const browserURL = location.pathname.concat(`?${queryParams.toString()}`);
    navigate(browserURL);
  };
}

export function formatLocale(locale) {
  switch (locale) {
    case 'zh':
      return 'zh-Hans';
    case 'zh-HA':
    case 'zh-HK':
    case 'zh-MO':
    case 'zh-TW':
      return 'zh-Hant';
    default:
      return locale;
  }
}

export function getSupportedLocale(requestedLocale, locales) {
  let locale = formatLocale(requestedLocale);
  if (!locales.includes(locale)) {
    locale = formatLocale(locale.split('-')[0]);
    if (!locales.includes(locale)) {
      locale = defaultLocale;
    }
  }
  return locale;
}

export function getLocale(requestedLocale) {
  const locales = localStorage.getItem(I18N_DEV_KEY)
    ? buildLocales
    : supportedLocales;
  return getSupportedLocale(requestedLocale, locales);
}

function sanitiseTheme(theme) {
  if (['dark', 'light'].includes(theme)) {
    return theme;
  }
  return 'system';
}

export function getTheme() {
  return sanitiseTheme(localStorage.getItem('tkn-theme'));
}

export function setTheme(selectedTheme = getTheme()) {
  const theme = sanitiseTheme(selectedTheme);
  ['dark', 'light', 'system'].forEach(themeType =>
    document.body.classList[themeType === theme ? 'add' : 'remove'](
      `tkn--theme-${themeType}`
    )
  );
  localStorage.setItem('tkn-theme', theme);
}
