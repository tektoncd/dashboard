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
import { Select, SelectItem, TextInput } from 'carbon-components-react';
import './SecretsModal.scss';

const BasicAuthFields = props => {
  const {
    username,
    password,
    namespace,
    handleChangeTextInput,
    handleChangeServiceAccount,
    invalidFields,
    serviceAccounts
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
        labelText="Username:"
        onChange={handleChangeTextInput}
        invalid={invalidFields.indexOf('username') > -1}
        invalidText="Username required."
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
        invalidText="Password or Token required."
      />
      <Select
        id="serviceAccount"
        light
        hidden
        defaultValue="main"
        onChange={handleChangeServiceAccount}
        labelText="Service Account"
        invalid={invalidFields.indexOf('serviceAccount') > -1}
        invalidText="Service Account required."
        disabled={namespace === ''}
      >
        <SelectItem disabled value="main" text="Select Service account" />
        {saItems}
      </Select>
    </>
  );
};

export default BasicAuthFields;
