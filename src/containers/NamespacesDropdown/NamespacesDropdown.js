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

import TooltipDropdown from '../../components/TooltipDropdown';
import { getNamespaces, isFetchingNamespaces } from '../../reducers';

const NamespacesDropdown = props => {
  return <TooltipDropdown {...props} />;
};

const allNamespacesLabel = 'All Namespaces';

NamespacesDropdown.defaultProps = {
  allNamespacesLabel,
  items: [],
  loading: false,
  label: 'Select Namespace',
  emptyText: 'No Namespaces found',
  showAllNamespaces: false
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { selectedItem, showAllNamespaces } = ownProps;

  if (selectedItem && selectedItem.id === '*') {
    selectedItem.text = allNamespacesLabel;
  }

  const items = getNamespaces(state);
  if (showAllNamespaces) {
    items.unshift({ id: '*', text: allNamespacesLabel });
  }

  return {
    items,
    loading: isFetchingNamespaces(state),
    selectedItem
  };
}

export default connect(mapStateToProps)(NamespacesDropdown);
