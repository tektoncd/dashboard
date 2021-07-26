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
import snakeCase from 'lodash.snakecase';
import { LogsToolbar } from '@tektoncd/dashboard-components';

import { getPodLog, getPodLogURL } from '../api';
import { get } from '../api/comms';
import config from '../../config_frontend/config.json';

const { locales: localesConfig } = config;
const {
  build: buildLocales,
  default: defaultLocale,
  devOverrideKey,
  supported: supportedLocales
} = localesConfig;

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

export function typeToPlural(type) {
  return `${snakeCase(type).toUpperCase()}S`;
}

export async function followLogs(stepName, stepStatus, taskRun) {
  const { namespace } = taskRun.metadata;
  const { podName } = taskRun.status || {};
  let logs;
  if (podName && stepStatus) {
    const { container } = stepStatus;
    logs = getPodLog({
      container,
      name: podName,
      namespace,
      stream: true
    });
  }
  return logs;
}

export async function fetchLogs(stepName, stepStatus, taskRun) {
  const { namespace } = taskRun.metadata;
  const { podName } = taskRun.status || {};
  let logs;
  if (podName && stepStatus) {
    const { container } = stepStatus;
    logs = getPodLog({
      container,
      name: podName,
      namespace
    });
  }
  return logs;
}

export function fetchLogsFallback(externalLogsURL) {
  if (!externalLogsURL) {
    return undefined;
  }

  return (stepName, stepStatus, taskRun) => {
    const { namespace } = taskRun.metadata;
    const { podName } = taskRun.status || {};
    const { container } = stepStatus;
    return get(`${externalLogsURL}/${namespace}/${podName}/${container}`, {
      Accept: 'text/plain'
    });
  };
}

export function getLogsRetriever(stream, externalLogsURL) {
  const logs = stream ? followLogs : fetchLogs;
  const fallback = fetchLogsFallback(externalLogsURL);

  if (fallback) {
    return (stepName, stepStatus, taskRun) =>
      logs(stepName, stepStatus, taskRun).catch(() =>
        fallback(stepName, stepStatus, taskRun)
      );
  }

  return logs;
}

export function isStale(resource, state, resourceIdField = 'uid') {
  const { [resourceIdField]: identifier } = resource.metadata;
  if (!state[identifier]) {
    return false;
  }
  const existingVersion = parseInt(
    state[identifier].metadata.resourceVersion,
    10
  );
  const incomingVersion = parseInt(resource.metadata.resourceVersion, 10);
  return existingVersion > incomingVersion;
}

// K8s label documentation comes from here:
// https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
const labelKeyRegex = new RegExp(
  '^(([a-z0-9A-Z]([a-z0-9A-Z-.]*[a-z0-9A-Z])?){0,253}/)?([a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?){1,63}$'
);
const labelValueRegex = new RegExp(
  '^([a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?){0,63}$'
);
export function isValidLabel(type, value) {
  const regex = type === 'key' ? labelKeyRegex : labelValueRegex;
  return regex.test(value);
}

export function getViewChangeHandler({ history, location, match }) {
  return function handleViewChange(view) {
    const queryParams = new URLSearchParams(location.search);

    queryParams.set('view', view);

    const browserURL = match.url.concat(`?${queryParams.toString()}`);
    history.push(browserURL);
  };
}

export function getLogsToolbar({
  isMaximized,
  stepStatus,
  taskRun,
  toggleMaximized
}) {
  const { container } = stepStatus;
  const { namespace } = taskRun.metadata;
  const { podName } = taskRun.status;

  const logURL = getPodLogURL({
    container,
    name: podName,
    namespace
  });

  return (
    <LogsToolbar
      isMaximized={isMaximized}
      name={`${podName}__${container}__log.txt`}
      toggleMaximized={toggleMaximized}
      url={logURL}
    />
  );
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
  const locales = localStorage.getItem(devOverrideKey)
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
