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
import './SecretsModal.scss';
import ServiceAccountsDropdown from '../../containers/ServiceAccountsDropdown';

const BasicAuthFields = props => {
  const {
    username,
    password,
    namespace,
    handleChangeTextInput,
    handleChangeServiceAccount,
    invalidFields,
    serviceAccount
  } = props;
  return (
    <>
      <TextInput
        id="username"
        autoComplete="off"
        placeholder=""
        value={username}
        labelText="Username:"
        onChange={handleChangeTextInput}
        invalid={invalidFields.indexOf('username') > -1}
        invalidText="Required."
      />
      <TextInput
        id="password"
        autoComplete="off"
        type="password"
        value={password}
        placeholder="********"
        labelText="Password/Token:"
        onChange={handleChangeTextInput}
        invalid={invalidFields.indexOf('password') > -1}
        invalidText="Required."
      />
      <ServiceAccountsDropdown
        id="serviceAccount"
        titleText="Service Account"
        namespace={namespace}
        selectedItem={
          serviceAccount ? { id: serviceAccount, text: serviceAccount } : ''
        }
        onChange={handleChangeServiceAccount}
        invalid={invalidFields.indexOf('serviceAccount') > -1}
        invalidText="Required."
      />
    </>
  );
};

export default BasicAuthFields;
