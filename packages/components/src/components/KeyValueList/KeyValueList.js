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
import { Button, TextInput } from 'carbon-components-react';
import { AddAlt24 as Add, SubtractAlt24 as Remove } from '@carbon/icons-react';
import './KeyValueList.scss';

const KeyValueList = props => {
  const {
    keyValues,
    minKeyValues,
    invalidFields,
    legendText,
    invalidText,
    onChange,
    onAdd,
    onRemove
  } = props;

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
          <div className="colon">:</div>
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
        </div>
      );
    }
  );

  return (
    <div className="keyvalues">
      <div className="labelAndButtons">
        <p className="label">{legendText}</p>
        <Button
          kind="ghost"
          renderIcon={Remove}
          onClick={onRemove}
          disabled={keyValueFields.length <= minKeyValues}
        >
          Remove
        </Button>
        <Button kind="ghost" renderIcon={Add} onClick={onAdd}>
          Add
        </Button>
      </div>
      {invalid && <p className="invalidKeyvalue">{invalidText}</p>}
      {keyValueFields}
    </div>
  );
};

export default KeyValueList;
