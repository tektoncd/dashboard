/*
Copyright 2019-2025 The Tekton Authors
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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import { useNamespaces, useProperties, useTenantNamespaces } from '../../api';

const NamespacesDropdown = ({
  allNamespacesLabel,
  children,
  dispatch,
  emptyText,
  isSideNavExpanded,
  label,
  selectedItem: originalSelectedItem,
  showAllNamespaces = false,
  titleText = 'Namespace',
  ...rest
}) => {
  const intl = useIntl();
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

  const { isFetching: isFetchingProperties } = useProperties();
  const tenantNamespaces = useTenantNamespaces();
  const { data: namespaces = [], isFetching: isFetchingNamespaces } =
    useNamespaces({
      disableWebSocket: true,
      enabled: !isFetchingProperties && !tenantNamespaces.length
    });

  const isFetching = isFetchingProperties || isFetchingNamespaces;

  const selectedItem = useMemo(() => {
    const newSelectedItem = { ...originalSelectedItem };
    if (newSelectedItem.id === ALL_NAMESPACES) {
      newSelectedItem.text = allNamespacesString;
    }

    return newSelectedItem;
  }, [originalSelectedItem?.id]);

  const items = tenantNamespaces.length
    ? tenantNamespaces
    : namespaces.map(namespace => namespace.metadata.name).sort();
  if (!tenantNamespaces.length && showAllNamespaces) {
    items.unshift({ id: ALL_NAMESPACES, text: allNamespacesString });
  }

  return (
    <TooltipDropdown
      {...rest}
      emptyText={emptyString}
      items={items}
      label={labelString}
      loading={isFetching}
      selectedItem={selectedItem}
      titleText={titleText}
    />
  );
};

export default NamespacesDropdown;
