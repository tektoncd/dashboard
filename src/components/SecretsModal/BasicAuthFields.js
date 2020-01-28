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
import { Select, SelectItem, TextInput } from 'carbon-components-react';

const BasicAuthFields = props => {
  const {
    handleChangeServiceAccount,
    handleChangeTextInput,
    intl,
    invalidFields,
    namespace,
    password,
    serviceAccounts,
    username
  } = props;

  const saItems = serviceAccounts.map(sa => (
    <SelectItem
      value={sa.metadata.name}
      text={sa.metadata.name}
      key={`${sa.metadata.namespace}:${sa.metadata.name}`}
    />
  ));

  return (
    <>
      <TextInput
        id="username"
        autoComplete="off"
        placeholder="username"
        value={username}
        labelText={intl.formatMessage({
          id: 'dashboard.basicAuthFields.username',
          defaultMessage: 'Username'
        })}
        onChange={handleChangeTextInput}
        invalid={'username' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.basicAuthFields.usernameRequired',
          defaultMessage: 'Username required.'
        })}
      />
      <TextInput
        id="password"
        autoComplete="off"
        type="password"
        value={password}
        placeholder="********"
        labelText={intl.formatMessage({
          id: 'dashboard.basicAuthFields.passwordToken',
          defaultMessage: 'Password/Token'
        })}
        onChange={handleChangeTextInput}
        invalid={'password' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.basicAuthFields.passwordTokenRequired',
          defaultMessage: 'Password or Token required.'
        })}
      />
      <Select
        id="serviceAccount"
        light
        hidden
        defaultValue="main"
        onChange={handleChangeServiceAccount}
        labelText={intl.formatMessage({
          id: 'dashboard.basicAuthFields.serviceAccount',
          defaultMessage: 'Service Account'
        })}
        invalid={'serviceAccount' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.basicAuthFields.serviceAccountRequired',
          defaultMessage: 'Service Account required.'
        })}
        disabled={namespace === ''}
      >
        <SelectItem
          disabled
          value="main"
          text={intl.formatMessage({
            id: 'dashboard.basicAuthFields.selectServiceAccount',
            defaultMessage: 'Select Service Account'
          })}
        />
        {saItems}
      </Select>
    </>
  );
};

export default injectIntl(BasicAuthFields);
