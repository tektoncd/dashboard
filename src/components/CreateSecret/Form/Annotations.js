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
import { Button, Dropdown, TextInput } from 'carbon-components-react';
import { AddAlt24 as Add, SubtractAlt16 as Remove } from '@carbon/icons-react';
import { getTranslateWithId } from '@tektoncd/dashboard-utils';

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

  const gitIntlText = intl.formatMessage({
    id: 'dashboard.createSecret.accessToGit',
    defaultMessage: 'Git Server'
  });

  const dockerIntlText = intl.formatMessage({
    id: 'dashboard.createSecret.accessToDocker',
    defaultMessage: 'Docker Registry'
  });

  const removeTitle = intl.formatMessage({
    id: 'dashboard.keyValueList.remove',
    defaultMessage: 'Remove'
  });

  return (
    <>
      {annotations.map((annotation, index) => (
        <div className="tkn--annotationDiv" key={annotation.id}>
          <Dropdown
            id="accessTo"
            titleText={intl.formatMessage({
              id: 'dashboard.createSecret.accessTo',
              defaultMessage: 'Access To'
            })}
            label=""
            initialSelectedItem={{
              id: annotation.access,
              text: annotation.access === 'git' ? gitIntlText : dockerIntlText
            }}
            items={[
              {
                id: 'git',
                text: gitIntlText
              },
              {
                id: 'docker',
                text: dockerIntlText
              }
            ]}
            itemToString={itemToString}
            onChange={e =>
              handleAnnotationChange('access', index, e.selectedItem)
            }
            disabled={loading}
            translateWithId={getTranslateWithId(intl)}
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
            <Button
              data-testid="removeIcon"
              disabled={loading}
              hasIconOnly
              iconDescription={removeTitle}
              kind="ghost"
              onClick={() => handleRemove(index)}
              renderIcon={Remove}
              size="field"
              tooltipAlignment="center"
              tooltipPosition="bottom"
            />
          )}
        </div>
      ))}
      <Button
        kind="ghost"
        renderIcon={Add}
        onClick={handleAdd}
        disabled={loading}
        iconDescription={intl.formatMessage({
          id: 'dashboard.keyValueList.add',
          defaultMessage: 'Add'
        })}
      >
        {intl.formatMessage({
          id: 'dashboard.createSecret.addAnnotations',
          defaultMessage: 'Add annotation'
        })}
      </Button>
    </>
  );
};

export default injectIntl(Annotations);
