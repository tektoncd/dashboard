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
import { connect } from 'react-redux';
import { Dropdown, DropdownSkeleton } from 'carbon-components-react';

import { getNamespaces, isFetchingNamespaces } from '../../reducers';

const itemToElement = ({ text }) => {
  return (
    <span key={text} title={text}>
      {text}
    </span>
  );
};

const itemToString = ({ text }) => text;

const itemStringToObject = text => ({ text });

const NamespacesDropdown = ({ items, loading, ...dropdownProps }) => {
  if (loading) {
    return <DropdownSkeleton {...dropdownProps} />;
  }
  const options = items.map(itemStringToObject);
  return (
    <Dropdown
      {...dropdownProps}
      itemToElement={itemToElement}
      items={options}
      itemToString={itemToString}
    />
  );
};

NamespacesDropdown.defaultProps = {
  items: [],
  loading: true
};

function mapStateToProps(state) {
  return {
    items: getNamespaces(state),
    loading: isFetchingNamespaces(state)
  };
}

export default connect(mapStateToProps)(NamespacesDropdown);
