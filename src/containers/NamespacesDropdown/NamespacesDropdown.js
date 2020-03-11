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
import { connect } from 'react-redux';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import { getNamespaces, isFetchingNamespaces } from '../../reducers';

const NamespacesDropdown = ({
  allNamespacesLabel,
  children,
  dispatch,
  emptyText,
  intl,
  isSideNavExpanded,
  label,
  namespaces,
  selectedItem: originalSelectedItem,
  showAllNamespaces,
  ...rest
}) => {
  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.namespacesDropdown.label',
      defaultMessage: 'Select Namespace'
    });
  const emptyString =
    emptyText ||
    intl.formatMessage({
      id: 'dashboard.namespacesDropdown.empty',
      defaultMessage: 'No Namespaces found'
    });

  const allNamespacesString =
    allNamespacesLabel ||
    intl.formatMessage({
      id: 'dashboard.namespacesDropdown.allNamespaces',
      defaultMessage: 'All Namespaces'
    });

  const selectedItem = { ...originalSelectedItem };
  if (selectedItem && selectedItem.id === ALL_NAMESPACES) {
    selectedItem.text = allNamespacesString;
  }

  const items = [...namespaces];
  if (showAllNamespaces) {
    items.unshift({ id: ALL_NAMESPACES, text: allNamespacesString });
  }

  return (
    <TooltipDropdown
      {...rest}
      label={labelString}
      emptyText={emptyString}
      selectedItem={selectedItem}
      items={items}
    />
  );
};

NamespacesDropdown.defaultProps = {
  loading: false,
  showAllNamespaces: false,
  titleText: 'Namespace'
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    loading: isFetchingNamespaces(state),
    namespaces: getNamespaces(state)
  };
}

export default connect(mapStateToProps)(injectIntl(NamespacesDropdown));
