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
import { ComboBox, DropdownSkeleton } from 'carbon-components-react';

const itemToElement = ({ id, text }) => {
  return (
    <div key={id} title={text}>
      {text}
    </div>
  );
};

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
    return <DropdownSkeleton className={className} id={id} inline={inline} />;
  }
  const options = items.map(itemToObject);

  return (
    <ComboBox
      className={className}
      disabled={disabled}
      id={id}
      inline={inline}
      items={options}
      itemToElement={itemToElement}
      itemToString={itemToString}
      label={options.length === 0 ? emptyText : label}
      light={light}
      onChange={onChange}
      placeholder={options.length === 0 ? emptyText : label}
      selectedItem={selectedItem}
      titleText={titleText}
      {...rest}
    />
  );
};

TooltipDropdown.defaultProps = {
  items: [],
  loading: false,
  emptyText: 'No items found'
};

export default TooltipDropdown;
