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

const BasicAuthFields = props => {
  const {
    username,
    password,
    handleChange,
    invalidFields,
    accessTo,
    serviceAccount
  } = props;
  return (
    <>
      <TextInput
        id="username"
        autoComplete="off"
        value={username}
        placeholder=""
        labelText="Username:"
        onChange={handleChange}
        invalid={invalidFields.indexOf('username') > -1}
        disabled={accessTo === ''}
      />
      <br />
      <TextInput
        id="password"
        autoComplete="off"
        type="password"
        value={password}
        placeholder=""
        labelText="Password/Token:"
        onChange={handleChange}
        invalid={invalidFields.indexOf('password') > -1}
        disabled={
          username.trim() === '' || invalidFields.indexOf('username') > -1
        }
      />
      <br />
      <TextInput
        id="serviceAccount"
        autoComplete="off"
        type="serviceAccount"
        value={serviceAccount}
        placeholder=""
        labelText="Service Account:"
        onChange={handleChange}
        invalid={invalidFields.indexOf('serviceAccount') > -1}
        disabled={
          password.trim() === '' || invalidFields.indexOf('password') > -1
        }
        invalidText="Must be less than 563 characters, contain only lowercase alphanumeric character, . or -"
      />
      <br />
    </>
  );
};

export default BasicAuthFields;
