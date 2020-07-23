/*
Copyright 2019-2020 The Tekton Authors
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
import {
  FormGroup,
  RadioButton,
  RadioButtonGroup,
  TextInput,
  Tooltip
} from 'carbon-components-react';
import NamespacesDropdown from '../../../containers/NamespacesDropdown';

const UniversalFields = props => {
  const {
    handleChangeNamespace,
    handleChangeTextInput,
    handleSecretType,
    intl,
    invalidFields,
    name,
    secretType,
    selectedNamespace,
    loading
  } = props;

  return (
    <>
      <TextInput
        id="name"
        placeholder="secret-name"
        value={name}
        labelText={intl.formatMessage({
          id: 'dashboard.universalFields.name',
          defaultMessage: 'Name'
        })}
        onChange={handleChangeTextInput}
        invalid={'name' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.universalFields.nameInvalid',
          defaultMessage:
            'Must not start or end with - and be less than 253 characters, contain only lowercase alphanumeric characters or -'
        })}
        autoComplete="off"
        disabled={loading}
      />
      <NamespacesDropdown
        id="namespace"
        selectedItem={
          selectedNamespace
            ? {
                id: selectedNamespace,
                text: selectedNamespace
              }
            : ''
        }
        onChange={handleChangeNamespace}
        invalid={'namespace' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.universalFields.namespaceInvalid',
          defaultMessage: 'Namespace required.'
        })}
        disabled={loading}
      />
      <FormGroup
        disabled={loading}
        legendText={
          <Tooltip
            direction="right"
            tabIndex={0}
            tooltipBodyId="secret-type-helper"
            triggerText={intl.formatMessage({
              id: 'dashboard.secretType.type',
              defaultMessage: 'Secret type'
            })}
          >
            <div>
              {intl.formatMessage({
                id: 'dashboard.secretType.helper',
                defaultMessage:
                  'Use Password with git or image PipelineResources that require authentication. Use Access Token with webhooks or with pullRequest PipelineResources. Check the Tekton Pipelines documentation for more details on authentication.'
              })}
            </div>
          </Tooltip>
        }
      >
        <RadioButtonGroup
          legend={intl.formatMessage({
            id: 'dashboard.universalFields.secretType',
            defaultMessage: 'Type'
          })}
          name="secret-type"
          orientation="vertical"
          labelPosition="right"
          valueSelected={secretType}
          onChange={handleSecretType}
        >
          <RadioButton
            value="password"
            id="password-radio"
            labelText={intl.formatMessage({
              id: 'dashboard.universalFields.passwordRadioButton',
              defaultMessage: 'Password'
            })}
          />
          <RadioButton
            value="accessToken"
            id="access-radio"
            labelText={intl.formatMessage({
              id: 'dashboard.accessTokenField.accessToken',
              defaultMessage: 'Access Token'
            })}
          />
        </RadioButtonGroup>
      </FormGroup>
    </>
  );
};

export default injectIntl(UniversalFields);
