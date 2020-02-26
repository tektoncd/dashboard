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

import { getPodLogURL } from '../../api';

const LogDownloadButton = ({ intl, stepStatus, taskRun }) => {
  const { container } = stepStatus;
  const { namespace, pod } = taskRun;

  const logURL = getPodLogURL({
    container,
    name: pod,
    namespace
  });

  return (
    <>
      <div className="bx--btn-set">
        <a
          className="bx--copy-btn"
          title={intl.formatMessage({
            id: 'dashboard.logs.launchButtonTooltip',
            defaultMessage: 'Open logs in a new window'
          })}
          href={logURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Launch16 />
        </a>
        <a
          className="bx--copy-btn"
          title={intl.formatMessage({
            id: 'dashboard.logs.downloadButtonTooltip',
            defaultMessage: 'Download logs'
          })}
          download={`${pod}__${container}__log.txt`}
          href={logURL}
        >
          <Download16 />
        </a>
      </div>
    </>
  );
};

export default injectIntl(LogDownloadButton);
