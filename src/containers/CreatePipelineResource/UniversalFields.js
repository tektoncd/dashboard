/*
Copyright 2019-2022 The Tekton Authors
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
import { useIntl } from 'react-intl';
import { getTranslateWithId } from '@tektoncd/dashboard-utils';

import NamespacesDropdown from '../NamespacesDropdown';

const itemToString = ({ text }) => text;

const UniversalFields = ({
  name,
  handleChangeTextInput,
  handleChangeNamespace,
  selectedNamespace,
  type,
  handleChangeType,
  url,
  invalidFields
}) => {
  const intl = useIntl();

  return (
    <>
      <TextInput
        id="name"
        placeholder={intl.formatMessage({
          id: 'dashboard.createPipelineResource.name',
          defaultMessage: 'pipeline-resource-name'
        })}
        value={name}
        labelText={intl.formatMessage({
          id: 'dashboard.createPipelineResource.nameLabel',
          defaultMessage: 'Name'
        })}
        onChange={handleChangeTextInput}
        invalid={'name' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.createResource.nameError',
          defaultMessage:
            "Must consist of lower case alphanumeric characters, '-' or '.', start and end with an alphanumeric character, and be at most 63 characters"
        })}
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
        invalid={'namespace' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.createPipelineResource.namespaceError',
          defaultMessage: 'Namespace required'
        })}
      />
      <Dropdown
        id="type"
        titleText={intl.formatMessage({
          id: 'dashboard.createPipelineResource.type',
          defaultMessage: 'Type'
        })}
        label=""
        initialSelectedItem={{
          id: type,
          text: type === 'Git' ? 'Git' : 'Image'
        }}
        items={[
          { id: 'git', text: 'Git' },
          { id: 'image', text: 'Image' }
        ]}
        itemToString={itemToString}
        onChange={handleChangeType}
        translateWithId={getTranslateWithId(intl)}
      />
      <TextInput
        id="url"
        placeholder={intl.formatMessage({
          id: 'dashboard.createPipelineResource.url',
          defaultMessage: 'pipeline-resource-url'
        })}
        value={url}
        labelText={intl.formatMessage({
          id: 'dashboard.createPipelineResource.urlLabel',
          defaultMessage: 'URL'
        })}
        onChange={handleChangeTextInput}
        invalid={'url' in invalidFields}
        invalidText={intl.formatMessage({
          id: 'dashboard.createPipelineResource.urlError',
          defaultMessage: 'URL required'
        })}
      />
    </>
  );
};

export default UniversalFields;
