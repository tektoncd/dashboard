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
import { Button, Dropdown, TextInput } from 'carbon-components-react';
import Remove from '@carbon/icons-react/lib/close--outline/20';
import Add from '@carbon/icons-react/lib/add--alt/24';

const itemToString = item => (item ? item.text : '');

const Annotations = props => {
  const {
    annotations,
    handleAdd,
    handleAnnotationChange,
    handleRemove,
    intl,
    invalidFields,
    loading
  } = props;

  return (
    <>
      {annotations.map((annotation, index) => {
        return (
          <div className="annotationDiv" key={annotation.id}>
            <Dropdown
              id="accessTo"
              titleText={intl.formatMessage({
                id: 'dashboard.createSecret.accessTo',
                defaultMessage: 'Access To'
              })}
              label=""
              initialSelectedItem={{
                id: annotation.access,
                text:
                  annotation.access === 'git' ? 'Git Server' : 'Docker Registry'
              }}
              items={[
                { id: 'git', text: 'Git Server' },
                { id: 'docker', text: 'Docker Registry' }
              ]}
              itemToString={itemToString}
              onChange={e =>
                handleAnnotationChange('access', index, e.selectedItem.id)
              }
              disabled={loading}
            />
            <TextInput
              id="serverURL"
              value={annotation.value}
              placeholder="https://github.com"
              labelText={intl.formatMessage({
                id: 'dashboard.universalFields.serverURL',
                defaultMessage: 'Server URL'
              })}
              onChange={e =>
                handleAnnotationChange('value', index, e.target.value)
              }
              invalid={annotation.id in invalidFields}
              invalidText={intl.formatMessage({
                id: 'dashboard.createSecret.serverURLInvalid',
                defaultMessage: 'Server URL required.'
              })}
              autoComplete="off"
              disabled={loading}
            />
            {annotations.length !== 1 && (
              <Remove
                className="removeIcon"
                data-testid="removeIcon"
                onClick={() => handleRemove(index)}
                disabled={loading}
              />
            )}
          </div>
        );
      })}
      <Button
        kind="ghost"
        renderIcon={Add}
        onClick={handleAdd}
        disabled={loading}
      >
        {intl.formatMessage({
          id: 'dashboard.createSecret.addAnnotations',
          defaultMessage: 'Add annotation.'
        })}
        Add annotation
      </Button>
    </>
  );
};

export default injectIntl(Annotations);
