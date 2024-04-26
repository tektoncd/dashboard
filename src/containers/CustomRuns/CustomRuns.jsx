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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom-v5-compat';
import { useIntl } from 'react-intl';
import keyBy from 'lodash.keyby';
import {
  ALL_NAMESPACES,
  getFilters,
  getStatus,
  urls,
  useTitleSync
} from '@tektoncd/dashboard-utils';
import {
  Actions,
  Link as CustomLink,
  DeleteModal,
  FormattedDate,
  FormattedDuration,
  StatusIcon,
  Table
} from '@tektoncd/dashboard-components';
import {
  Add16 as Add,
  Calendar16 as CalendarIcon,
  TrashCan32 as DeleteIcon,
  Time16 as TimeIcon,
  Lightning16 as TriggersIcon,
  UndefinedFilled20 as UndefinedIcon
} from '@carbon/icons-react';

import ListPageLayout from '../ListPageLayout';
import {
  cancelCustomRun,
  deleteCustomRun,
  rerunCustomRun,
  useCustomRuns,
  useIsReadOnly,
  useSelectedNamespace
} from '../../api';
import { sortRunsByCreationTime } from '../../utils';

function getRunTriggerInfo(run) {
  const { labels = {} } = run.metadata;
  const eventListener = labels['triggers.tekton.dev/eventlistener'];
  const trigger = labels['triggers.tekton.dev/trigger'];
  const pipelineRun = labels['tekton.dev/pipelineRun'];
  if (!eventListener && !trigger && !pipelineRun) {
    return null;
  }

  if (pipelineRun) {
    return <span title={`PipelineRun: ${pipelineRun}`}>{pipelineRun}</span>;
  }

  return (
    <span
      title={`EventListener: ${eventListener || '-'}\nTrigger: ${
        trigger || '-'
      }`}
    >
      <TriggersIcon />
      {eventListener}
      {eventListener && trigger ? ' | ' : ''}
      {trigger}
    </span>
  );
}

function getRunStatus(run) {
  const { reason } = getStatus(run);
  return reason;
}

function getRunStatusIcon(run) {
  const { reason, status } = getStatus(run);
  return (
    <StatusIcon
      DefaultIcon={UndefinedIcon}
      isCustomTask
      reason={reason}
      status={status}
    />
  );
}

function getRunStatusTooltip(run) {
  const { message } = getStatus(run);
  const reason = getRunStatus(run);
  if (!message) {
    return reason;
  }
  return `${reason}: ${message}`;
}

function CustomRuns() {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const filters = getFilters(location);

  useTitleSync({ page: 'CustomRuns' });

  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const [cancelSelection, setCancelSelection] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState([]);

  const isReadOnly = useIsReadOnly();

  useEffect(() => {
    setDeleteError(null);
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }, [JSON.stringify(filters), namespace]);

  const {
    data: runs = [],
    error,
    isLoading
  } = useCustomRuns({
    filters,
    namespace
  });

  sortRunsByCreationTime(runs);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.customRuns.error',
          defaultMessage: 'Error loading CustomRuns'
        })
      };
    }

    if (deleteError) {
      return {
        clear: () => setDeleteError(null),
        error: deleteError
      };
    }

    return null;
  }

  function openDeleteModal(selectedRows, handleCancel) {
    const resourcesById = keyBy(runs, 'metadata.uid');
    const resourcesToBeDeleted = selectedRows.map(
      ({ id }) => resourcesById[id]
    );

    setShowDeleteModal(true);
    setToBeDeleted(resourcesToBeDeleted);
    setCancelSelection(() => handleCancel);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setToBeDeleted([]);
  }

  function cancel(run) {
    cancelCustomRun({
      name: run.metadata.name,
      namespace: run.metadata.namespace
    });
  }

  function rerun(run) {
    rerunCustomRun(run);
  }

  function editAndRun(run) {
    navigate(
      `${urls.customRuns.create()}?mode=yaml&customRunName=${
        run.metadata.name
      }&namespace=${run.metadata.namespace}`
    );
  }

  function deleteResource(run) {
    const { name, namespace: resourceNamespace } = run.metadata;
    return deleteCustomRun({ name, namespace: resourceNamespace }).catch(
      err => {
        err.response.text().then(text => {
          const statusCode = err.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          setDeleteError(errorMessage);
        });
      }
    );
  }

  async function handleDelete() {
    const deletions = toBeDeleted.map(resource => deleteResource(resource));
    closeDeleteModal();
    await Promise.all(deletions);
    cancelSelection();
  }

  function getRunActions() {
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
          id: 'dashboard.cancelTaskRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: cancel,
        disable: resource => {
          const { status } = getStatus(resource);
          return status && status !== 'Unknown';
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelCustomRun.heading',
            defaultMessage: 'Stop CustomRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelCustomRun.primaryText',
            defaultMessage: 'Stop CustomRun'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelCustomRun.body',
                defaultMessage:
                  'Are you sure you would like to stop CustomRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
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
            { kind: 'CustomRuns' }
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

  const toolbarButtons = isReadOnly
    ? []
    : [
        {
          onClick: () => {
            const queryString = new URLSearchParams({
              ...(namespace !== ALL_NAMESPACES && { namespace }),
              // currently default is yaml mode
              mode: 'yaml'
            }).toString();
            navigate(
              urls.customRuns.create() + (queryString ? `?${queryString}` : '')
            );
          },
          text: intl.formatMessage({
            id: 'dashboard.actions.createButton',
            defaultMessage: 'Create'
          }),
          icon: Add
        }
      ];

  const batchActionButtons = isReadOnly
    ? []
    : [
        {
          onClick: openDeleteModal,
          text: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          icon: DeleteIcon
        }
      ];

  const initialHeaders = [
    {
      key: 'run',
      header: 'Run'
    },
    {
      key: 'status',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.status',
        defaultMessage: 'Status'
      })
    },
    {
      key: 'customTask',
      header: intl.formatMessage({
        id: 'dashboard.customTask.heading',
        defaultMessage: 'Custom Task'
      })
    },
    {
      key: 'time',
      header: ''
    }
  ];

  if (!isReadOnly) {
    initialHeaders.push({ key: 'actions', header: '' });
  }

  return (
    <ListPageLayout
      error={getError()}
      filters={filters}
      resources={runs}
      title="CustomRuns"
    >
      {({ resources }) => {
        const runsFormatted = resources.map(run => {
          const { creationTimestamp } = run.metadata;

          const additionalFields =
            run?.spec?.customRef || run?.spec?.customSpec || {};
          const { apiVersion, kind, name: customTaskName } = additionalFields;
          const customTaskTooltipParts = [
            `${intl.formatMessage({
              id: 'dashboard.resource.apiVersion',
              defaultMessage: 'API version:'
            })} ${apiVersion}`,
            `${intl.formatMessage({
              id: 'dashboard.resource.kind',
              defaultMessage: 'Kind:'
            })} ${kind}`
          ];
          if (customTaskName) {
            customTaskTooltipParts.push(
              `${intl.formatMessage({
                id: 'dashboard.resource.name',
                defaultMessage: 'Name:'
              })} ${customTaskName}`
            );
          }
          const customTaskTooltip = customTaskTooltipParts.join('\n');

          const {
            lastTransitionTime,
            reason,
            status,
            message: statusMessage
          } = getStatus(run);

          const statusIcon = getRunStatusIcon(run);

          let endTime = Date.now();
          if (status === 'False' || status === 'True') {
            endTime = new Date(lastTransitionTime).getTime();
          }

          const duration = (
            <FormattedDuration
              milliseconds={endTime - new Date(creationTimestamp).getTime()}
            />
          );

          const runActions = getRunActions();

          return {
            id: run.metadata.uid,
            run: (
              <div>
                <span>
                  <Link
                    component={CustomLink}
                    to={urls.customRuns.byName({
                      namespace: run.metadata.namespace,
                      runName: run.metadata.name
                    })}
                    title={run.metadata.name}
                  >
                    {run.metadata.name}
                  </Link>
                </span>
                <span className="tkn--table--sub">
                  {getRunTriggerInfo(run)}&nbsp;
                </span>
              </div>
            ),
            status: (
              <div>
                <div className="tkn--definition">
                  <div
                    className="tkn--status"
                    data-reason={reason}
                    data-status={status}
                    title={getRunStatusTooltip(run)}
                  >
                    {statusIcon}
                    {getRunStatus(run)}
                  </div>
                </div>
                {status === 'False' ? (
                  <span className="tkn--table--sub" title={statusMessage}>
                    {statusMessage}&nbsp;
                  </span>
                ) : (
                  <span className="tkn--table--sub">&nbsp;</span>
                )}
              </div>
            ),
            customTask: (
              <div>
                <span title={customTaskTooltip}>
                  {apiVersion} {kind}
                </span>
                <span
                  className="tkn--table--sub"
                  title={`Namespace: ${run.metadata.namespace}`}
                >
                  {run.metadata.namespace}
                </span>
              </div>
            ),
            time: (
              <div>
                <span>
                  <CalendarIcon />
                  <FormattedDate
                    date={run.metadata.creationTimestamp}
                    formatTooltip={formattedDate =>
                      intl.formatMessage(
                        {
                          id: 'dashboard.resource.createdTime',
                          defaultMessage: 'Created: {created}'
                        },
                        {
                          created: formattedDate
                        }
                      )
                    }
                  />
                </span>
                <div className="tkn--table--sub">
                  <TimeIcon />
                  {duration}
                </div>
              </div>
            ),
            actions: runActions.length ? (
              <Actions items={runActions} resource={run} />
            ) : null
          };
        });

        return (
          <>
            <Table
              toolbarButtons={toolbarButtons}
              batchActionButtons={batchActionButtons}
              emptyTextAllNamespaces={intl.formatMessage(
                {
                  id: 'dashboard.emptyState.allNamespaces',
                  defaultMessage: 'No matching {kind} found'
                },
                { kind: 'CustomRuns' }
              )}
              emptyTextSelectedNamespace={intl.formatMessage(
                {
                  id: 'dashboard.emptyState.selectedNamespace',
                  defaultMessage:
                    'No matching {kind} found in namespace {selectedNamespace}'
                },
                { kind: 'CustomRuns', selectedNamespace }
              )}
              hasDetails
              headers={initialHeaders}
              loading={isLoading}
              rows={runsFormatted}
              selectedNamespace={selectedNamespace}
            />
            {showDeleteModal ? (
              <DeleteModal
                kind="CustomRuns"
                onClose={closeDeleteModal}
                onSubmit={handleDelete}
                resources={toBeDeleted}
                showNamespace={namespace === ALL_NAMESPACES}
              />
            ) : null}
          </>
        );
      }}
    </ListPageLayout>
  );
}

export default CustomRuns;
