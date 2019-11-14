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
import Add from '@carbon/icons-react/lib/add--alt/24';
import Remove from '@carbon/icons-react/lib/subtract--alt/24';
import Delete from '@carbon/icons-react/lib/delete/16';
import './SecretsModal.scss';

const Annotations = props => {
  const {
    annotations,
    handleChange,
    handleAdd,
    handleRemove,
    invalidFields
  } = props;

  const annotationFields = annotations.map((annotation, index) => {
    return (
      <div className="annotationRow" key={`annotationRow${annotation.id}`}>
        <TextInput
          id={`annotation-label${index}`}
          labelText=""
          aria-label={`Annotation Label#${index}. This is the tag Tekton uses for its resources.`}
          value={annotation.label}
          placeholder="tekton.dev/{source}-0"
          onChange={e => {
            handleChange({ key: 'label', index, value: e.target.value });
          }}
          invalid={invalidFields.indexOf(`annotation-label${index}`) > -1}
          autoComplete="off"
        />
        <div className="colon">:</div>
        <TextInput
          id={`annotation-value${index}`}
          labelText=""
          aria-label={`Annotation Value#${index}. This is the url for the given Tekton resource.`}
          value={annotation.value}
          placeholder={annotation.placeholder}
          onChange={e => {
            handleChange({ key: 'value', index, value: e.target.value });
          }}
          invalid={invalidFields.indexOf(`annotation-value${index}`) > -1}
          autoComplete="off"
        />
        {annotation.value && (
          <Delete
            className="deleteInputIcon"
            aria-label={`Delete Button#${index}. Deletes entire entry in current text field.`}
            onClick={() => {
              handleChange({ key: 'value', index, value: '' });
            }}
          />
        )}
      </div>
    );
  });

  return (
    <div className="annotations">
      <div className="labelAndButtons">
        <p className="label">Server URL</p>
        <Remove
          className={
            annotationFields.length === 1 ? 'removeIconDisabled' : 'removeIcon'
          }
          onClick={handleRemove}
          aria-label="Remove Button. Removes a Server URL entry."
        />
        <Add
          className="addIcon"
          onClick={handleAdd}
          aria-label="Add Button. Adds another Server URL entry."
        />
      </div>
      {invalidFields.find(field => field.includes('annotation-value')) !==
        undefined && <p className="invalidAnnotation">Server URL required.</p>}
      {annotationFields}
    </div>
  );
};

export default Annotations;
