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

const PasswordType = props => {
  const {
    handleChangeTextInput,
    intl,
    invalidFields,
    password,
    username,
    loading
  } = props;

  return (
    <>
      <TextInput
        id="username"
        autoComplete="off"
        placeholder="username"
        value={username}
        labelText={intl.formatMessage({
          id: 'dashboard.passwordTypeFields.username',
          defaultMessage: 'Username'
        })}
        onChange={handleChangeTextInput}
        invalid={'username' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.passwordTypeFields.usernameRequired',
          defaultMessage: 'Username required.'
        })}
        disabled={loading}
      />
      <TextInput.PasswordInput
        id="password"
        autoComplete="off"
        value={password}
        placeholder="********"
        labelText={intl.formatMessage({
          id: 'dashboard.passwordTypeFields.passwordToken',
          defaultMessage: 'Password'
        })}
        onChange={handleChangeTextInput}
        invalid={'password' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.passwordTypeFields.passwordTokenRequired',
          defaultMessage: 'Password required.'
        })}
        disabled={loading}
        showPasswordLabel={intl.formatMessage({
          id: 'dashboard.passwordTypeFields.showPasswordLabel',
          defaultMessage: 'Show password'
        })}
        hidePasswordLabel={intl.formatMessage({
          id: 'dashboard.passwordTypeFields.hidePasswordLabel',
          defaultMessage: 'Hide password'
        })}
      />
    </>
  );
};

export default injectIntl(PasswordType);
