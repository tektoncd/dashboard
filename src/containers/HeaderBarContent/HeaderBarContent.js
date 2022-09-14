/*
Copyright 2022 The Tekton Authors
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
import React, { useEffect } from 'react';
import {
  generatePath,
  useHistory,
  useLocation,
  useParams
} from 'react-router-dom';
import { ALL_NAMESPACES, paths } from '@tektoncd/dashboard-utils';

import { NamespacesDropdown } from '..';
import { useSelectedNamespace, useTenantNamespace } from '../../api';

export default function HeaderBarContent({ logoutButton }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const {
    namespacedMatch,
    selectedNamespace: namespace,
    selectNamespace
  } = useSelectedNamespace();
  const tenantNamespace = useTenantNamespace();

  useEffect(() => {
    if (params.namespace) {
      selectNamespace(params.namespace);
    }
  }, [params.namespace]);

  function setPath(path, { dropQueryParams } = {}) {
    history.push(`${path}${dropQueryParams ? '' : location.search}`);
  }

  function handleNamespaceSelected(event) {
    const newNamespace = event.selectedItem?.id || ALL_NAMESPACES;
    selectNamespace(newNamespace);

    if (!namespacedMatch) {
      return;
    }

    if (newNamespace === ALL_NAMESPACES) {
      if (namespacedMatch.allNamespacesPath) {
        setPath(
          generatePath(namespacedMatch.allNamespacesPath, {
            ...namespacedMatch.params
          }),
          {
            dropQueryParams: true
          }
        );
      } else {
        setPath(
          generatePath(namespacedMatch.path.replace(paths.byNamespace(), ''), {
            ...namespacedMatch.params
          })
        );
      }
      return;
    }

    const prefix = namespacedMatch.params?.namespace ? '' : paths.byNamespace();

    const newURL = generatePath(`${prefix}${namespacedMatch.path}`, {
      ...namespacedMatch.params,
      namespace: newNamespace
    });
    setPath(newURL);
  }

  return (
    <>
      {tenantNamespace ? null : (
        <NamespacesDropdown
          id="header-namespace-dropdown"
          onChange={handleNamespaceSelected}
          selectedItem={{ id: namespace, text: namespace }}
          showAllNamespaces
          size="sm"
          titleText=""
        />
      )}
      {logoutButton}
    </>
  );
}
