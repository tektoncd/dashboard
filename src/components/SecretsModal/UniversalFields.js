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
import { Dropdown, TextInput } from 'carbon-components-react';
import NamespacesDropdown from '../../containers/NamespacesDropdown';

const itemToString = item => (item ? item.text : '');

const UniversalFields = props => {
  const {
    accessTo,
    handleChangeAccessTo,
    handleChangeNamespace,
    handleChangeTextInput,
    intl,
    invalidFields,
    name,
    selectedNamespace
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
      />
      <NamespacesDropdown
        id="namespace"
        light
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
      />
      <Dropdown
        id="accessTo"
        titleText={intl.formatMessage({
          id: 'dashboard.universalFields.accessTo',
          defaultMessage: 'Access To'
        })}
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

export default injectIntl(UniversalFields);
