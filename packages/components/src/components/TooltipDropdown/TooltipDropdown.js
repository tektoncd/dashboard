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
import { ComboBox, DropdownSkeleton } from 'carbon-components-react';
import { getTranslateWithId } from '@tektoncd/dashboard-utils';

const itemToString = item => (item ? item.text : '');

const itemToObject = item => {
  if (typeof item === 'string') {
    return { id: item, text: item };
  }

  return item;
};

const TooltipDropdown = ({
  className,
  disabled,
  emptyText,
  id,
  inline,
  intl,
  items,
  label,
  light,
  loading,
  onChange,
  selectedItem,
  titleText,
  ...rest
}) => {
  if (loading) {
    return (
      <div className="bx--list-box__wrapper">
        {titleText && <span className="bx--label">{titleText}</span>}
        <DropdownSkeleton
          className={`bx--combo-box ${className || ''}`}
          id={id}
          inline={inline}
        />
      </div>
    );
  }

  const options = items.map(itemToObject);
  const emptyString =
    emptyText ||
    intl.formatMessage({
      id: 'dashboard.tooltipDropdown.empty',
      defaultMessage: 'No items found'
    });

  return (
    <ComboBox
      className={className}
      disabled={disabled}
      id={id}
      inline={inline}
      items={options}
      itemToString={itemToString}
      label={options.length === 0 ? emptyString : label}
      light={light}
      onChange={onChange}
      placeholder={options.length === 0 ? emptyString : label}
      selectedItem={selectedItem}
      titleText={titleText}
      translateWithId={getTranslateWithId(intl)}
      {...rest}
    />
  );
};

TooltipDropdown.defaultProps = {
  items: [],
  loading: false
};

export default injectIntl(TooltipDropdown);
