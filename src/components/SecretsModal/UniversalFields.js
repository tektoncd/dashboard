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
import { TextInput, Select, SelectItem } from 'carbon-components-react';
import './SecretsModal.scss';

const UniversalFields = props => {
  const {
    name,
    handleChange,
    accessTo,
    selectedNamespace,
    namespaces,
    invalidFields
  } = props;

  return (
    <>
      <TextInput
        id="name"
        placeholder=""
        value={name}
        labelText="Name:"
        onChange={handleChange}
        invalid={invalidFields.indexOf('name') > -1}
        invalidText="Must be less than 563 characters, contain only lowercase alphanumeric character, . or -"
        autoComplete="off"
      />
      <br />
      <Select
        className="input-modal"
        id="namespace"
        labelText="Namespace:"
        onChange={handleChange}
        value={selectedNamespace}
        disabled={name.trim() === '' || invalidFields.indexOf('name') > -1}
        invalid={invalidFields.indexOf('namespace') > -1}
      >
        <SelectItem disabled value="." text="Pick desired namespace" />
        <SelectItem value="" text="" />
        {namespaces.map(namespace => {
          return (
            <SelectItem
              value={namespace}
              key={namespace}
              text={`${namespace.charAt(0).toUpperCase()}${namespace.slice(1)}`}
            />
          );
        })}
      </Select>
      <br />
      <Select
        className="input-modal"
        id="accessTo"
        labelText="Access To:"
        value={accessTo}
        onChange={handleChange}
        disabled={selectedNamespace === ''}
        invalid={invalidFields.indexOf('accessTo') > -1}
      >
        <SelectItem
          disabled
          value="."
          text="This credential will grant access to"
        />
        <SelectItem value="" text="" />
        <SelectItem value="git" text="Git Server" />
        <SelectItem value="docker" text="Docker Registry" />
      </Select>
      <br />
    </>
  );
};

export default UniversalFields;
