/*
Copyright 2022-2024 The Tekton Authors
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
import { useEffect } from 'react';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom-v5-compat';
import { ALL_NAMESPACES, paths, urls } from '@tektoncd/dashboard-utils';

import NamespacesDropdown from '../NamespacesDropdown';
import { useSelectedNamespace, useTenantNamespaces } from '../../api';

export default function HeaderBarContent({ isFetchingConfig, logoutButton }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const tenantNamespaces = useTenantNamespaces();

  const {
    namespacedMatch,
    selectedNamespace: namespace,
    selectNamespace
  } = useSelectedNamespace();

  useEffect(() => {
    if (params.namespace) {
      selectNamespace(params.namespace);
    } else if (tenantNamespaces.length) {
      selectNamespace(tenantNamespaces[0]);
    }
  }, [params.namespace, JSON.stringify(tenantNamespaces)]);

  function setPath(path, { dropQueryParams } = {}) {
    navigate(`${path}${dropQueryParams ? '' : location.search}`);
  }

  function handleNamespaceSelected(event) {
    const newNamespace =
      event.selectedItem?.id || tenantNamespaces[0] || ALL_NAMESPACES;
    selectNamespace(newNamespace);

    if (!namespacedMatch) {
      return;
    }

    if (newNamespace === ALL_NAMESPACES) {
      if (namespacedMatch.isResourceDetails) {
        setPath(
          location.pathname
            .replace(urls.byNamespace({ namespace }), '')
            .split('/')
            .slice(0, -1) // drop resource name
            .join('/'),
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

  return isFetchingConfig ? null : (
    <>
      <NamespacesDropdown
        id="header-namespace-dropdown"
        onChange={handleNamespaceSelected}
        selectedItem={{ id: namespace, text: namespace }}
        showAllNamespaces
        size="sm"
        titleText=""
      />
      {logoutButton}
    </>
  );
}
