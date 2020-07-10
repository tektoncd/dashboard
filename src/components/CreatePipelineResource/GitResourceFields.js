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
import { TextInput } from 'carbon-components-react';
import { injectIntl } from 'react-intl';

const GitResourceFields = props => {
  const { revision, handleChangeTextInput, invalidFields, intl } = props;

  return (
    <TextInput
      id="revision"
      placeholder={intl.formatMessage({
        id: 'dashboard.createPipelineResource.revision',
        defaultMessage: 'pipeline-resource-revision'
      })}
      value={revision}
      labelText={intl.formatMessage({
        id: 'dashboard.createPipelineResource.revisionLabel',
        defaultMessage: 'Revision'
      })}
      onChange={handleChangeTextInput}
      invalid={'revision' in invalidFields}
      invalidText={intl.formatMessage({
        id: 'dashboard.createPipelineResource.revisionError',
        defaultMessage: 'Revision required'
      })}
      autoComplete="off"
    />
  );
};

export default injectIntl(GitResourceFields);
