/*
Copyright 2021-2025 The Tekton Authors
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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useTitleSync } from '@tektoncd/dashboard-utils';
import { RadioTile, Stack, TileGroup, Toggle } from '@carbon/react';
import {
  Asleep as DarkIcon,
  Light as LightIcon,
  Devices as SystemIcon
} from '@carbon/react/icons';

import { getTheme, setTheme } from '../../utils';
import {
  isPipelinesV1ResourcesEnabled,
  setPipelinesV1ResourcesEnabled
} from '../../api/utils';

export function Settings() {
  const intl = useIntl();
  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.settings.title',
      defaultMessage: 'Settings'
    })
  });

  const [theme, setThemeState] = useState(() => getTheme());
  function onSelectTheme(selectedTheme) {
    setThemeState(selectedTheme);
    setTheme(selectedTheme);
  }

  return (
    <div className="tkn--settings">
      <h1 id="main-content-header" tabIndex={-1}>
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
          valueSelected={theme}
          onChange={selectedTheme => onSelectTheme(selectedTheme)}
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

        <Stack gap={7}>
          <Toggle
            defaultToggled={isPipelinesV1ResourcesEnabled()}
            id="tkn--pipelines-v1-resources-toggle"
            labelText={intl.formatMessage({
              id: 'dashboard.pipelines.v1Resources.label',
              defaultMessage: 'Use Tekton Pipelines API version v1'
            })}
            labelA={intl.formatMessage({
              id: 'dashboard.toggle.off',
              defaultMessage: 'Off'
            })}
            labelB={intl.formatMessage({
              id: 'dashboard.toggle.on',
              defaultMessage: 'On'
            })}
            onToggle={checked => setPipelinesV1ResourcesEnabled(checked)}
          />
        </Stack>
      </div>
    </div>
  );
}

export default Settings;
