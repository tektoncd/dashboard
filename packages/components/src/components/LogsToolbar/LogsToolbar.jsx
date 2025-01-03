/*
Copyright 2020-2025 The Tekton Authors
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
import {
  Download,
  Launch,
  Maximize,
  Minimize,
  Settings
} from '@carbon/react/icons';
import {
  Checkbox,
  CheckboxGroup,
  Popover,
  PopoverContent,
  usePrefix
} from '@carbon/react';
import { useState } from 'react';

const LogsToolbar = ({
  id,
  isMaximized,
  name,
  logLevels,
  onToggleShowTimestamps,
  onToggleLogLevel,
  onToggleMaximized,
  showTimestamps,
  url
}) => {
  const carbonPrefix = usePrefix();
  const intl = useIntl();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={`${carbonPrefix}--btn-set`}>
      {onToggleMaximized ? (
        <button
          className={`${carbonPrefix}--btn ${carbonPrefix}--btn--icon-only ${carbonPrefix}--copy-btn`}
          onClick={onToggleMaximized}
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
      {url ? (
        <>
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
        </>
      ) : null}
      <Popover
        align="bottom-end"
        autoAlign
        className="tkn--log-settings-menu"
        isTabTip
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            setIsSettingsOpen(false);
          }
        }}
        onRequestClose={_event => {
          setIsSettingsOpen(open => !open);
        }}
        open={isSettingsOpen}
      >
        <button
          aria-expanded={isSettingsOpen}
          aria-label={intl.formatMessage({
            id: 'dashboard.settings.title',
            defaultMessage: 'Settings'
          })}
          onClick={() => setIsSettingsOpen(open => !open)}
          title={intl.formatMessage({
            id: 'dashboard.settings.title',
            defaultMessage: 'Settings'
          })}
          type="button"
        >
          <Settings />
        </button>
        <PopoverContent className="tkn--log-settings-menu-content">
          <Checkbox
            id={`${id}-timestamps-toggle`}
            labelText={intl.formatMessage({
              id: 'dashboard.logs.showTimestamps.label',
              defaultMessage: 'Show timestamps'
            })}
            onChange={(_event, { checked }) => {
              onToggleShowTimestamps(checked);
            }}
            checked={showTimestamps}
          />
          {logLevels && onToggleLogLevel ? (
            <>
              <hr />
              <CheckboxGroup
                legendText={intl.formatMessage({
                  id: 'dashboard.logs.logLevels.label',
                  defaultMessage: 'Log levels'
                })}
              >
                <Checkbox
                  id={`${id}-loglevels-error-toggle`}
                  labelText={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.error',
                    defaultMessage: 'Error'
                  })}
                  onChange={(_event, { checked }) => {
                    onToggleLogLevel({ error: checked });
                  }}
                  checked={logLevels.error}
                />
                <Checkbox
                  id={`${id}-loglevels-warning-toggle`}
                  labelText={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.warning',
                    defaultMessage: 'Warning'
                  })}
                  onChange={(_event, { checked }) => {
                    onToggleLogLevel({ warning: checked });
                  }}
                  checked={logLevels.warning}
                />
                <Checkbox
                  id={`${id}-loglevels-notice-toggle`}
                  labelText={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.notice',
                    defaultMessage: 'Notice'
                  })}
                  onChange={(_event, { checked }) => {
                    onToggleLogLevel({ notice: checked });
                  }}
                  checked={logLevels.notice}
                />
                <Checkbox
                  id={`${id}-loglevels-info-toggle`}
                  labelText={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.info',
                    defaultMessage: 'Info (default)'
                  })}
                  onChange={(_event, { checked }) => {
                    onToggleLogLevel({ info: checked });
                  }}
                  checked={logLevels.info}
                />
                <Checkbox
                  id={`${id}-loglevels-debug-toggle`}
                  labelText={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.debug',
                    defaultMessage: 'Debug'
                  })}
                  onChange={(_event, { checked }) => {
                    onToggleLogLevel({ debug: checked });
                  }}
                  checked={logLevels.debug}
                />
              </CheckboxGroup>
            </>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LogsToolbar;
