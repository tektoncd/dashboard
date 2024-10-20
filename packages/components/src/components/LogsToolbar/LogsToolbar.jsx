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
import {
  Download,
  Launch,
  Maximize,
  Minimize,
  Settings
} from '@carbon/react/icons';
import {
  unstable_FeatureFlags as FeatureFlags,
  MenuItemDivider,
  MenuItemGroup,
  MenuItemSelectable,
  OverflowMenu,
  usePrefix
} from '@carbon/react';

const LogsToolbar = ({
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
      <FeatureFlags enableV12Overflowmenu>
        <OverflowMenu
          className="tkn--log-settings-menu"
          renderIcon={Settings}
          size="sm"
        >
          <MenuItemSelectable
            label={intl.formatMessage({
              id: 'dashboard.logs.showTimestamps.label',
              defaultMessage: 'Show timestamps'
            })}
            onChange={onToggleShowTimestamps}
            selected={showTimestamps}
          />
          {logLevels && onToggleLogLevel ? (
            <>
              <MenuItemDivider />
              <MenuItemGroup
                label={intl.formatMessage({
                  id: 'dashboard.logs.logLevels.label',
                  defaultMessage: 'Log levels'
                })}
              >
                <MenuItemSelectable
                  label={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.error',
                    defaultMessage: 'Error'
                  })}
                  onChange={error => onToggleLogLevel({ error })}
                  selected={logLevels.error}
                />
                <MenuItemSelectable
                  label={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.warning',
                    defaultMessage: 'Warning'
                  })}
                  onChange={warning => onToggleLogLevel({ warning })}
                  selected={logLevels.warning}
                />
                <MenuItemSelectable
                  label={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.notice',
                    defaultMessage: 'Notice'
                  })}
                  onChange={notice => onToggleLogLevel({ notice })}
                  selected={logLevels.notice}
                />
                <MenuItemSelectable
                  label={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.info',
                    defaultMessage: 'Info (default)'
                  })}
                  onChange={info => onToggleLogLevel({ info })}
                  selected={logLevels.info}
                />
                <MenuItemSelectable
                  label={intl.formatMessage({
                    id: 'dashboard.logs.logLevels.debug',
                    defaultMessage: 'Debug'
                  })}
                  onChange={debug => onToggleLogLevel({ debug })}
                  selected={logLevels.debug}
                />
              </MenuItemGroup>
            </>
          ) : null}
        </OverflowMenu>
      </FeatureFlags>
    </div>
  );
};

export default LogsToolbar;
