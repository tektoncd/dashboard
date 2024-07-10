/*
Copyright 2020-2024 The Tekton Authors
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
import { useIntl } from 'react-intl';
import { Download, Launch, Maximize, Minimize } from '@carbon/react/icons';
import { usePrefix } from '@carbon/react';

const LogsToolbar = ({ isMaximized, name, toggleMaximized, url }) => {
  const carbonPrefix = usePrefix();
  const intl = useIntl();
  return (
    <div className={`${carbonPrefix}--btn-set`}>
      {toggleMaximized ? (
        <button
          className={`${carbonPrefix}--btn ${carbonPrefix}--btn--icon-only ${carbonPrefix}--copy-btn`}
          onClick={toggleMaximized}
          type="button"
        >
          {isMaximized ? (
            <Minimize>
              <title>
                {intl.formatMessage({
                  id: 'dashboard.logs.restore',
                  defaultMessage: 'Return to default'
                })}
              </title>
            </Minimize>
          ) : (
            <Maximize>
              <title>
                {intl.formatMessage({
                  id: 'dashboard.logs.maximize',
                  defaultMessage: 'Maximize'
                })}
              </title>
            </Maximize>
          )}
        </button>
      ) : null}
      <a
        className={`${carbonPrefix}--btn ${carbonPrefix}--btn--icon-only ${carbonPrefix}--copy-btn`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Launch>
          <title>
            {intl.formatMessage({
              id: 'dashboard.logs.launchButtonTooltip',
              defaultMessage: 'Open logs in a new window'
            })}
          </title>
        </Launch>
      </a>
      <a
        className={`${carbonPrefix}--btn ${carbonPrefix}--btn--icon-only ${carbonPrefix}--copy-btn`}
        download={name}
        href={url}
      >
        <Download>
          <title>
            {intl.formatMessage({
              id: 'dashboard.logs.downloadButtonTooltip',
              defaultMessage: 'Download logs'
            })}
          </title>
        </Download>
      </a>
    </div>
  );
};

export default LogsToolbar;
