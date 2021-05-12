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

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { CopyButton, SkeletonPlaceholder } from 'carbon-components-react';
import { copyToClipboard } from '@tektoncd/dashboard-utils';

import { FormattedDate } from '..';

class RunHeader extends Component {
  /* istanbul ignore next */
  copyStatusMessage = () => {
    copyToClipboard(this.props.message);
  };

  render() {
    const {
      intl,
      lastTransitionTime,
      loading,
      message,
      runName,
      reason,
      status,
      triggerHeader
    } = this.props;

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
                <h1 className="tkn--run-header--heading">
                  <div className="tkn--run-name" title={runName}>
                    {runName}
                  </div>
                  <span className="tkn--time">
                    {lastTransitionTime
                      ? intl.formatMessage(
                          {
                            id: 'dashboard.lastUpdated',
                            defaultMessage: 'Last updated {time}'
                          },
                          {
                            time: (
                              <FormattedDate
                                date={lastTransitionTime}
                                relative
                              />
                            )
                          }
                        )
                      : null}
                  </span>
                  {this.props.children}
                </h1>
                <div className="tkn--status">
                  <span className="tkn--status-label">{reason}</span>
                  {message && (
                    <>
                      <span className="tkn--status-message" title={message}>
                        {message}
                      </span>
                      <CopyButton
                        feedback={intl.formatMessage({
                          id: 'dashboard.clipboard.copied',
                          defaultMessage: 'Copied!'
                        })}
                        iconDescription={intl.formatMessage({
                          id: 'dashboard.clipboard.copyStatusMessage',
                          defaultMessage: 'Copy status message to clipboard'
                        })}
                        onClick={this.copyStatusMessage}
                      />
                    </>
                  )}
                </div>
                {triggerHeader}
              </>
            )
          );
        })()}
      </header>
    );
  }
}

export default injectIntl(RunHeader);
