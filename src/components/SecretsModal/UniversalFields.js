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
import { Dropdown, TextInput } from 'carbon-components-react';
import './SecretsModal.scss';
import NamespacesDropdown from '../../containers/NamespacesDropdown';

const itemToString = item => (item ? item.text : '');

const UniversalFields = props => {
  const {
    name,
    handleChangeTextInput,
    handleChangeAccessTo,
    handleChangeNamespace,
    accessTo,
    selectedNamespace,
    invalidFields
  } = props;

  return (
    <>
      <TextInput
        id="name"
        placeholder="secret-name"
        value={name}
        labelText="Name:"
        onChange={handleChangeTextInput}
        invalid={invalidFields.indexOf('name') > -1}
        invalidText="Must not start or end with - and be less than 253 characters, contain only lowercase alphanumeric characters or -"
        autoComplete="off"
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
        invalid={invalidFields.indexOf('namespace') > -1}
        invalidText="Namespace required."
      />
      <Dropdown
        id="accessTo"
        titleText="Access To:"
        label=""
        initialSelectedItem={{
          id: accessTo,
          text: accessTo === 'git' ? 'Git Server' : 'Docker Registry'
        }}
        items={[
          { id: 'git', text: 'Git Server' },
          { id: 'docker', text: 'Docker Registry' }
        ]}
        itemToString={itemToString}
        onChange={handleChangeAccessTo}
      />
    </>
  );
};

export default UniversalFields;
