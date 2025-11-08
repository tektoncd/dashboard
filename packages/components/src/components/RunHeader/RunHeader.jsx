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

import { useIntl } from 'react-intl';
import { InlineNotification, SkeletonPlaceholder } from '@carbon/react';
import RunTimeMetadata from '../RunTimeMetadata';
import RunMetadataColumn from '../RunMetadataColumn';
import LabelsWithOverflow from '../LabelsWithOverflow/LabelsWithOverflow';
import StatusIcon from '../StatusIcon';

export default function RunHeader({
  children,
  description,
  displayRunHeader = true,
  duration = null,
  lastTransitionTime,
  loading,
  message,
  namespace,
  pipelineRunError,
  reason,
  resource,
  runName,
  showFailureMessage,
  status,
  triggerHeader,
  triggerInfo
}) {
  const intl = useIntl();

  const errorNotification = (pipelineRunError || showFailureMessage) && (
    <InlineNotification
      kind="error"
      hideCloseButton
      lowContrast
      title={
        pipelineRunError
          ? intl.formatMessage(
              {
                id: 'dashboard.pipelineRun.failedMessage',
                defaultMessage: 'Unable to load PipelineRun: {reason}'
              },
              { reason }
            )
          : intl.formatMessage({
              id: 'dashboard.pipelineRun.errorMessage',
              defaultMessage: 'Status message:'
            })
      }
      subtitle={message}
    />
  );

  return (
    <header
      className="tkn--pipeline-run-header"
      data-succeeded={status}
      data-reason={reason}
    >
      {(() => {
        if (loading) {
          return (
            <SkeletonPlaceholder
              className="tkn--header-skeleton"
              title={intl.formatMessage({
                id: 'dashboard.loading',
                defaultMessage: 'Loading…'
              })}
            />
          );
        }
        return (
          runName && (
            <>
              {displayRunHeader && (
                <h1 className="tkn--run-header--heading" tabIndex={-1}>
                  <div className="tkn--run-name" title={runName}>
                    {runName}
                  </div>
                  <span className="tkn--status-label" title={message || reason}>
                    <StatusIcon reason={reason} status={status} />
                    <div>{reason}</div>
                  </span>
                  {children}
                </h1>
              )}
              {errorNotification}
              <div className="tkn--runmetadata-container">
                <div className="tkn--columns">
                  {triggerInfo ? (
                    <RunMetadataColumn
                      columnHeader={intl.formatMessage({
                        id: 'dashboard.runMetadata.triggeredBy',
                        defaultMessage: 'Triggered by'
                      })}
                      columnContent={triggerInfo}
                    />
                  ) : null}
                  {!triggerHeader && resource && (
                    <RunMetadataColumn
                      columnHeader={intl.formatMessage({
                        id: 'dashboard.runMetadata.labels',
                        defaultMessage: 'Labels'
                      })}
                      columnContent={
                        <LabelsWithOverflow
                          resource={resource}
                          namespace={namespace}
                        />
                      }
                    />
                  )}
                  {triggerHeader}
                  {lastTransitionTime ? (
                    <RunMetadataColumn
                      columnHeader={intl.formatMessage({
                        id: 'dashboard.runMetadata.time',
                        defaultMessage: 'Time'
                      })}
                      columnContent={
                        <RunTimeMetadata
                          lastTransitionTime={lastTransitionTime}
                          duration={duration}
                        />
                      }
                    />
                  ) : null}
                </div>
                <div className="tkn--info-row">{description}</div>
              </div>
            </>
          )
        );
      })()}
    </header>
  );
}
