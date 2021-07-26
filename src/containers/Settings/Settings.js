/*
Copyright 2021 The Tekton Authors
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
import { injectIntl } from 'react-intl';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { RadioTile, TileGroup, Toggle } from 'carbon-components-react';
import {
  Asleep16 as DarkIcon,
  Light16 as LightIcon,
  Devices16 as SystemIcon
} from '@carbon/icons-react';

import { getTheme, setTheme } from '../../utils';
import {
  isLogTimestampsEnabled,
  setLogTimestampsEnabled
} from '../../api/utils';

export function Settings({ intl }) {
  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.settings.title',
      defaultMessage: 'Settings'
    })
  });

  return (
    <div className="tkn--settings">
      <h1 id="main-content-header">
        {intl.formatMessage({
          id: 'dashboard.settings.title',
          defaultMessage: 'Settings'
        })}
      </h1>
      <div className="tkn--settings--content">
        <TileGroup
          legend={intl.formatMessage({
            id: 'dashboard.theme.label',
            defaultMessage: 'Theme'
          })}
          name="theme-group"
          valueSelected={getTheme()}
          onChange={theme => setTheme(theme)}
        >
          <RadioTile value="system" name="theme">
            <SystemIcon />
            {intl.formatMessage({
              id: 'dashboard.theme.system',
              defaultMessage: 'System'
            })}
          </RadioTile>
          <RadioTile value="dark" name="theme">
            <DarkIcon />
            {intl.formatMessage({
              id: 'dashboard.theme.dark',
              defaultMessage: 'Dark'
            })}
          </RadioTile>
          <RadioTile value="light" name="theme">
            <LightIcon />
            {intl.formatMessage({
              id: 'dashboard.theme.light',
              defaultMessage: 'Light'
            })}
          </RadioTile>
        </TileGroup>

        <Toggle
          defaultToggled={isLogTimestampsEnabled()}
          id="tkn--log-timestamps-toggle"
          labelText={intl.formatMessage({
            id: 'dashboard.logs.showTimestamps.label',
            defaultMessage: 'Show log timestamps'
          })}
          labelA={intl.formatMessage({
            id: 'dashboard.toggle.off',
            defaultMessage: 'Off'
          })}
          labelB={intl.formatMessage({
            id: 'dashboard.toggle.on',
            defaultMessage: 'On'
          })}
          onToggle={checked => setLogTimestampsEnabled(checked)}
        />
      </div>
    </div>
  );
}

export default injectIntl(Settings);
