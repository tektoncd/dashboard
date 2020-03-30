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
import { Button, TextInput } from 'carbon-components-react';
import { AddAlt24 as Add, CloseOutline20 as Remove } from '@carbon/icons-react';

import './KeyValueList.scss';

const KeyValueList = props => {
  const {
    intl,
    invalidFields,
    invalidText,
    keyValues,
    legendText,
    minKeyValues,
    onAdd,
    onChange,
    onRemove
  } = props;

  const addText = intl.formatMessage({
    id: 'dashboard.keyValueList.add',
    defaultMessage: 'Add'
  });

  const removeTitle = intl.formatMessage({
    id: 'dashboard.keyValueList.remove',
    defaultMessage: 'Remove'
  });

  let invalid = false;
  const keyValueFields = keyValues.map(
    ({ id, key, keyPlaceholder, value, valuePlaceholder }, index) => {
      const keyId = `${id}-key`;
      const valueId = `${id}-value`;
      const invalidKey = keyId in invalidFields;
      const invalidValue = valueId in invalidFields;
      invalid = invalid || invalidKey || invalidValue;
      return (
        <div className="keyvalueRow" key={`keyvalueRow${id}`}>
          <TextInput
            id={keyId}
            labelText=""
            value={key}
            placeholder={keyPlaceholder}
            onChange={e => {
              onChange({ type: 'key', index, value: e.target.value });
            }}
            invalid={invalidKey}
            autoComplete="off"
          />
          <TextInput
            id={valueId}
            labelText=""
            value={value}
            placeholder={valuePlaceholder}
            onChange={e => {
              onChange({ type: 'value', index, value: e.target.value });
            }}
            invalid={invalidValue}
            autoComplete="off"
          />
          {keyValues.length > minKeyValues && (
            <Remove
              className="removeIcon"
              onClick={() => onRemove(index)}
              title={removeTitle}
            />
          )}
        </div>
      );
    }
  );

  return (
    <div className="keyvalues">
      <p className="label">{legendText}</p>
      {invalid && <p className="invalidKeyvalue">{invalidText}</p>}
      {keyValueFields}
      <Button
        iconDescription={addText}
        kind="ghost"
        onClick={onAdd}
        renderIcon={Add}
      >
        {addText}
      </Button>
    </div>
  );
};

KeyValueList.defaultProps = {
  minKeyValues: 0
};

export default injectIntl(KeyValueList);
