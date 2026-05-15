/*
Copyright 2020-2026 The Tekton Authors
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
import { Download, Launch } from '@carbon/react/icons';
import { Button, ButtonSet } from '@carbon/react';

const StepLogToolbar = ({ name, url }) => {
  const intl = useIntl();

  return (
    <ButtonSet className="tkn--toolbar">
      <Button
        autoAlign
        hasIconOnly
        href={url}
        iconDescription={intl.formatMessage({
          id: 'dashboard.logs.launchButtonTooltip',
          defaultMessage: 'Open logs in a new window'
        })}
        kind="ghost"
        target="_blank"
        rel="noopener noreferrer"
        renderIcon={Launch}
        size="sm"
      />
      <Button
        autoAlign
        download={name}
        hasIconOnly
        href={url}
        iconDescription={intl.formatMessage({
          id: 'dashboard.logs.downloadButtonTooltip',
          defaultMessage: 'Download logs'
        })}
        kind="ghost"
        renderIcon={Download}
        size="sm"
      />
    </ButtonSet>
  );
};

export default StepLogToolbar;
