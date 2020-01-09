/*
Copyright 2019 The Tekton Authors
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

import { ViewYAML } from '..';

import './StepStatus.scss';

const StepStatus = ({ intl, status }) => {
  return (
    <div className="step-status">
      <div className="title">
        {intl.formatMessage({
          id: 'dashboard.step.containerStatus',
          defaultMessage: 'Container status'
        })}
        :
      </div>
      <ViewYAML
        resource={
          status ||
          intl.formatMessage({
            id: 'dashboard.step.statusNotAvailable',
            defaultMessage: 'No status available'
          })
        }
      />
    </div>
  );
};

export default injectIntl(StepStatus);
