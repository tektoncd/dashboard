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
import Add from '@carbon/icons-react/lib/add--alt/16';
import Remove from '@carbon/icons-react/lib/close--outline/16';
import './SecretsModal.scss';

const Annotations = props => {
  const {
    annotations,
    handleChange,
    handleAdd,
    handleRemove,
    invalidFields,
    disabled
  } = props;

  const annotationFields = [];
  for (let i = 0; i < annotations.length; i += 2) {
    annotationFields.push(
      <div className="annotationRow" key={i}>
        <TextInput
          id={`annotation${i}`}
          labelText=""
          key={`annotation${i}`}
          value={annotations[i]}
          placeholder=""
          onChange={handleChange}
          invalid={invalidFields.indexOf(`annotation${i}`) > -1}
          autoComplete="off"
          disabled={disabled}
        />
        <div key={`colon${i}`} className="colon">
          :
        </div>
        <TextInput
          id={`annotation${i + 1}`}
          labelText=""
          key={`annotation${i + 1}`}
          value={annotations[i + 1]}
          placeholder=""
          onChange={handleChange}
          invalid={invalidFields.indexOf(`annotation${i + 1}`) > -1}
          autoComplete="off"
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="annotations">
      <>
        <div className="labelAndButtons">
          <p className="label">Server URL:</p>
          <Remove className="removeIcon" onClick={handleRemove} />
          <Add className="addIcon" onClick={handleAdd} />
        </div>
        {annotationFields}
        <br />
      </>
    </div>
  );
};

Annotations.defaultProps = {};

export default Annotations;
