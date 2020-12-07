/*
Copyright 2020 The Tekton Authors
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
import React from 'react';
import { injectIntl } from 'react-intl';
import { Download16, Launch16 } from '@carbon/icons-react';

const LogDownloadButton = ({ intl, name, url }) => (
  <>
    <div className="bx--btn-set">
      <a
        className="bx--copy-btn"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Launch16>
          <title>
            {intl.formatMessage({
              id: 'dashboard.logs.launchButtonTooltip',
              defaultMessage: 'Open logs in a new window'
            })}
          </title>
        </Launch16>
      </a>
      <a className="bx--copy-btn" download={name} href={url}>
        <Download16>
          <title>
            {intl.formatMessage({
              id: 'dashboard.logs.downloadButtonTooltip',
              defaultMessage: 'Download logs'
            })}
          </title>
        </Download16>
      </a>
    </div>
  </>
);

export default injectIntl(LogDownloadButton);
