/*
Copyright 2020 The Tekton Authors
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

import React, { createElement } from 'react';
import PropTypes from 'prop-types';

import { injectIntl } from 'react-intl';
import { RadioButtonGroup, RadioButton, icons } from 'carbon-components-react';

function RadioGroup({
  title,
  options,
  getSelected,
  defaultSelected,
  orientation
}) {
  return (
    <RadioButtonGroup
      name={title}
      legendText={title}
      orientation={orientation}
      onChange={getSelected}
      defaultSelected={defaultSelected}
    >
      {options.map(o => (
        <>
          <RadioButton
            labelText={o.label}
            value={o.value}
            id={o.value}
            disabled={o.disabled}
          />
          {createElement(o.icon, { className: 'radio-block-icon' })}
        </>
      ))}
    </RadioButtonGroup>
  );
}

RadioGroup.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    }).isRequired
  ),
  getSelected: PropTypes.func.isRequired,
  defaultSelected: PropTypes.string,
  orientation: PropTypes.string
};

export default injectIntl(RadioGroup);
