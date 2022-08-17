/*
Copyright 2022 The Tekton Authors
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
/* istanbul ignore file */

import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { UndefinedFilled20 as UndefinedIcon } from '@carbon/icons-react';
import {
  FormattedDuration,
  ResourceDetails,
  StatusIcon,
  Table
} from '@tektoncd/dashboard-components';
import { getStatus, useTitleSync } from '@tektoncd/dashboard-utils';

import { useRun } from '../../api';
import { getViewChangeHandler } from '../../utils';

function getRunDuration(run) {
  if (!run) {
    return null;
  }

  const { creationTimestamp } = run.metadata;
  const { lastTransitionTime, status } = getStatus(run);

  let endTime = Date.now();
  if (status === 'False' || status === 'True') {
    endTime = new Date(lastTransitionTime).getTime();
  }

  return (
    <FormattedDuration
      milliseconds={endTime - new Date(creationTimestamp).getTime()}
    />
  );
}

function getRunStatus(run) {
  const { reason } = getStatus(run);
  return reason;
}

function getRunStatusIcon(run) {
  if (!run) {
    return null;
  }
  const { reason, status } = getStatus(run);
  return (
    <StatusIcon DefaultIcon={UndefinedIcon} reason={reason} status={status} />
  );
}

function getRunStatusTooltip(run) {
  if (!run) {
    return null;
  }
  const { message } = getStatus(run);
  const reason = getRunStatus(run);
  if (!message) {
    return reason;
  }
  return `${reason} - ${message}`;
}

function Run({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const { namespace, runName: resourceName } = useParams();

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'Run',
    resourceName
  });

  const {
    data: run,
    error,
    isFetching
  } = useRun({
    name: resourceName,
    namespace
  });

  const additionalFields = run?.spec?.ref || run?.spec?.spec || {};
  const { apiVersion, kind, name: customTaskName } = additionalFields;

  const headersForParameters = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'value',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.value',
        defaultMessage: 'Value'
      })
    }
  ];

  const rowsForParameters =
    run?.spec?.params?.map(({ name, value }) => ({
      id: name,
      name,
      value
    })) || [];

  return (
    <ResourceDetails
      additionalMetadata={
        <>
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.run.duration.label',
                defaultMessage: 'Duration:'
              })}
            </span>
            {getRunDuration(run)}
          </p>
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.filter.status.title',
                defaultMessage: 'Status:'
              })}
            </span>
            {getRunStatusIcon(run)}
            {getRunStatusTooltip(run)}
          </p>
        </>
      }
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler({ history, location })}
      resource={run}
      view={view}
    >
      <>
        <h4>
          {intl.formatMessage({
            id: 'dashboard.customTask.heading',
            defaultMessage: 'Custom Task'
          })}
        </h4>
        <div className="tkn--resourcedetails-metadata">
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.resource.apiVersion',
                defaultMessage: 'API version:'
              })}
            </span>
            {apiVersion}
          </p>
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.resource.kind',
                defaultMessage: 'Kind:'
              })}
            </span>
            {kind}
          </p>
          {customTaskName ? (
            <p>
              <span>
                {intl.formatMessage({
                  id: 'dashboard.resource.name',
                  defaultMessage: 'Name:'
                })}
              </span>
              {customTaskName}
            </p>
          ) : null}
        </div>
        {rowsForParameters.length ? (
          <Table
            title={intl.formatMessage({
              id: 'dashboard.parameters.title',
              defaultMessage: 'Parameters'
            })}
            headers={headersForParameters}
            rows={rowsForParameters}
            size="sm"
          />
        ) : null}
        {/* TODO: results */}
      </>
    </ResourceDetails>
  );
}

export default injectIntl(Run);
