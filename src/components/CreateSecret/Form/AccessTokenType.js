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
import { TextInput } from 'carbon-components-react';

const AccessTokenType = props => {
  const {
    accessToken,
    handleChangeTextInput,
    intl,
    invalidFields,
    loading
  } = props;

  return (
    <TextInput.PasswordInput
      id="accessToken"
      autoComplete="off"
      placeholder="*********"
      value={accessToken}
      labelText={intl.formatMessage({
        id: 'dashboard.accessTokenField.accessToken',
        defaultMessage: 'Access Token'
      })}
      onChange={handleChangeTextInput}
      invalid={'accessToken' in invalidFields}
      invalidText={intl.formatMessage({
        id: 'dashboard.accessTokenField.accessTokenRequired',
        defaultMessage: 'Access Token required.'
      })}
      disabled={loading}
      showPasswordLabel={intl.formatMessage({
        id: 'dashboard.accessTokenField.showPasswordLabel',
        defaultMessage: 'Show access token'
      })}
      hidePasswordLabel={intl.formatMessage({
        id: 'dashboard.accessTokenField.hidePasswordLabel',
        defaultMessage: 'Hide access token'
      })}
    />
  );
};

export default injectIntl(AccessTokenType);
