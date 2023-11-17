/*
Copyright 2023 The Tekton Authors
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
import { useIntl } from 'react-intl';
import { Loading as CarbonLoading } from 'carbon-components-react';
import { getCarbonPrefix } from '@tektoncd/dashboard-utils';

const carbonPrefix = getCarbonPrefix();

export default function Loading({ message }) {
  const intl = useIntl();

  let messageToDisplay = message;
  if (!message) {
    messageToDisplay = intl.formatMessage({
      id: 'dashboard.loading',
      defaultMessage: 'Loading…'
    });
  }
  return (
    <div className={`${carbonPrefix}--loading-overlay tkn--loading-overlay`}>
      <CarbonLoading description={messageToDisplay} withOverlay={false} />
      <span className="tkn--loading-text">{messageToDisplay}</span>
    </div>
  );
}
