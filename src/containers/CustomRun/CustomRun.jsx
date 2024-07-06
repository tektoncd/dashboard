/*
Copyright 2022-2024 The Tekton Authors
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

import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { UndefinedFilled as UndefinedIcon } from "@carbon/react/icons";
import {
  Actions,
  FormattedDuration,
  Param,
  ResourceDetails,
  StatusIcon,
  Table
} from '@tektoncd/dashboard-components';
import { getStatus, urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { InlineNotification, usePrefix } from '@carbon/react';

import {
  deleteCustomRun,
  rerunCustomRun,
  useCustomRun,
  useIsReadOnly
} from '../../api';
import { getViewChangeHandler } from '../../utils';
import NotFound from '../NotFound';

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
    <StatusIcon
      DefaultIcon={props => <UndefinedIcon size={20} {...props} />}
      isCustomTask
      reason={reason}
      status={status}
    />
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

function CustomRun() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { namespace, name: resourceName } = useParams();
  const carbonPrefix = usePrefix();

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const [showNotification, setShowNotification] = useState(null);
  const isReadOnly = useIsReadOnly();

  useTitleSync({
    page: 'CustomRun',
    resourceName
  });

  const {
    data: run,
    error,
    isFetching
  } = useCustomRun({
    name: resourceName,
    namespace
  });

  const additionalFields = run?.spec?.customRef || run?.spec?.customSpec || {};
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
      value: <Param>{value}</Param>
    })) || [];

  function deleteResource() {
    deleteCustomRun({
      name: run.metadata.name,
      namespace: run.metadata.namespace
    })
      .then(() => {
        navigate(urls.customRuns.byNamespace({ namespace }));
      })
      .catch(err => {
        err.response.text().then(text => {
          const statusCode = err.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setShowNotification({
            kind: 'error',
            message: errorMessage
          });
        });
      });
  }

  function rerun() {
    rerunCustomRun(run)
      .then(newRun => {
        setShowNotification({
          kind: 'success',
          logsURL: urls.customRuns.byName({
            name: newRun.metadata.name,
            namespace
          }),
          message: intl.formatMessage({
            id: 'dashboard.rerun.triggered',
            defaultMessage: 'Triggered rerun'
          })
        });
      })
      .catch(rerunError => {
        setShowNotification({
          kind: 'error',
          message: intl.formatMessage(
            {
              id: 'dashboard.rerun.error',
              defaultMessage:
                'An error occurred when rerunning {runName}: check the dashboard logs for details. Status code: {statusCode}'
            },
            {
              runName: run.metadata.name,
              statusCode: rerunError.response.status
            }
          )
        });
      });
  }

  function editAndRun() {
    navigate(
      `${urls.customRuns.create()}?mode=yaml&customRunName=${
        run.metadata.name
      }&namespace=${run.metadata.namespace}`
    );
  }

  function runActions() {
    if (isReadOnly) {
      return [];
    }
    return [
      {
        action: rerun,
        actionText: intl.formatMessage({
          id: 'dashboard.rerun.actionText',
          defaultMessage: 'Rerun'
        }),
        disable: resource => !!resource.metadata.labels?.['tekton.dev/pipeline']
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.editAndRun.actionText',
          defaultMessage: 'Edit and run'
        }),
        action: editAndRun
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: deleteResource,
        danger: true,
        disable: resource => {
          const { status } = getStatus(resource);
          return status === 'Unknown';
        },
        hasDivider: true,
        modalProperties: {
          danger: true,
          heading: intl.formatMessage(
            {
              id: 'dashboard.deleteResources.heading',
              defaultMessage: 'Delete {kind}'
            },
            { kind: 'CustomRun' }
          ),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteCustomRun.body',
                defaultMessage:
                  'Are you sure you would like to delete CustomRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  }

  if (!isFetching && (error || !run)) {
    return (
      <NotFound
        suggestions={[
          {
            text: 'CustomRuns',
            to: urls.customRuns.byNamespace({ namespace })
          }
        ]}
      />
    );
  }

  return (
    <>
      {showNotification && (
        <InlineNotification
          lowContrast
          actions={
            showNotification.logsURL ? (
              <Link
                className={`${carbonPrefix}--inline-notification__text-wrapper`}
                to={showNotification.logsURL}
              >
                {intl.formatMessage({
                  id: 'dashboard.run.rerunStatusMessage',
                  defaultMessage: 'View status'
                })}
              </Link>
            ) : (
              ''
            )
          }
          title={showNotification.message}
          kind={showNotification.kind}
          caption=""
        />
      )}

      <ResourceDetails
        actions={
          isReadOnly ? null : (
            <Actions items={runActions()} kind="button" resource={run} />
          )
        }
        additionalMetadata={
          <>
            <li>
              <span>
                {intl.formatMessage({
                  id: 'dashboard.run.duration.label',
                  defaultMessage: 'Duration:'
                })}
              </span>
              {getRunDuration(run)}
            </li>
            <li>
              <span>
                {intl.formatMessage({
                  id: 'dashboard.filter.status.title',
                  defaultMessage: 'Status:'
                })}
              </span>
              {getRunStatusIcon(run)}
              {getRunStatusTooltip(run)}
            </li>
          </>
        }
        error={error}
        loading={isFetching}
        onViewChange={getViewChangeHandler({ location, navigate })}
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
    </>
  );
}

export default CustomRun;
