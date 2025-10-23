/*
Copyright 2022-2025 The Tekton Authors
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

import { fireEvent, waitFor } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import HeaderBarContent from './HeaderBarContent';

describe('HeaderBarContent', () => {
  it('selects namespace based on URL', () => {
    const namespace = 'default';
    const selectNamespace = vi.fn();
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: null,
      selectNamespace
    }));
    const path = '/namespaces/:namespace/foo';
    renderWithRouter(<HeaderBarContent />, {
      path,
      route: path.replace(':namespace', namespace)
    });
    expect(selectNamespace).toHaveBeenCalledWith(namespace);
  });

  it('adds namespace to URL when selected', async () => {
    const otherNamespace = 'foo';
    const path = '/fake/path';
    vi.spyOn(API, 'useProperties').mockImplementation(() => ({
      isFetching: false
    }));
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: otherNamespace } }]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: ALL_NAMESPACES,
      selectNamespace: () => {}
    }));
    const { getByText, getByDisplayValue } = renderWithRouter(
      <HeaderBarContent />,
      { handle: { isNamespaced: true, path }, path, route: path }
    );
    fireEvent.click(getByDisplayValue(/All Namespaces/i));
    fireEvent.click(getByText(otherNamespace));
    expect(window.location.pathname).toEqual(
      `/namespaces/${otherNamespace}${path}`
    );
  });

  it('updates namespace in URL', async () => {
    const namespace = 'default';
    const otherNamespace = 'foo';
    const path = '/namespaces/:namespace/fake/path';
    vi.spyOn(API, 'useProperties').mockImplementation(() => ({
      isFetching: false
    }));
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [
        { metadata: { name: namespace } },
        { metadata: { name: otherNamespace } }
      ]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: namespace,
      selectNamespace: () => {}
    }));
    const selectNamespace = vi.fn();
    const { getByText, getByDisplayValue } = renderWithRouter(
      <HeaderBarContent />,
      {
        handle: { isNamespaced: true, path },
        path,
        route: path.replace(':namespace', namespace)
      }
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(otherNamespace));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(window.location.pathname).toEqual(
      `/namespaces/${otherNamespace}/fake/path`
    );
  });

  it('removes namespace from URL when ALL_NAMESPACES is selected', async () => {
    const namespace = 'default';
    const path = '/namespaces/:namespace/fake/path';
    const selectNamespace = vi.fn();
    vi.spyOn(API, 'useProperties').mockImplementation(() => ({
      isFetching: false
    }));
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: namespace } }]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: namespace,
      selectNamespace
    }));
    const { getByText, getByDisplayValue } = renderWithRouter(
      <HeaderBarContent />,
      {
        handle: { isNamespaced: true, path },
        path,
        route: path.replace(':namespace', namespace)
      }
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(/All Namespaces/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(window.location.pathname).toEqual('/fake/path');
  });

  it('removes namespace from URL when clearing selection', async () => {
    const namespace = 'default';
    const path = '/namespaces/:namespace/fake/path';
    const selectNamespace = vi.fn();
    vi.spyOn(API, 'useProperties').mockImplementation(() => ({
      isFetching: false
    }));
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: namespace } }]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: namespace,
      selectNamespace
    }));
    const { getByTitle } = renderWithRouter(<HeaderBarContent />, {
      handle: { isNamespaced: true, path },
      path,
      route: path.replace(':namespace', namespace)
    });
    fireEvent.click(getByTitle(/clear selected item/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(window.location.pathname).toEqual('/fake/path');
  });

  it('selects first namespace when clearing selection in tenant namespace visibility mode', async () => {
    const tenantNamespace1 = 'fake_tenantNamespace1';
    const tenantNamespace2 = 'fake_tenantNamespace2';
    const path = '/namespaces/:namespace/fake/path';
    const selectNamespace = vi.fn();
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => []);
    vi.spyOn(API, 'useTenantNamespaces').mockImplementation(() => [
      tenantNamespace1,
      tenantNamespace2
    ]);
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: tenantNamespace2,
      selectNamespace
    }));
    const { getByDisplayValue, getByTitle } = renderWithRouter(
      <HeaderBarContent />,
      {
        handle: { isNamespaced: true, path },
        path,
        route: path.replace(':namespace', tenantNamespace2)
      }
    );
    await waitFor(() => getByDisplayValue(tenantNamespace2));
    fireEvent.click(getByTitle(/clear selected item/i));
    expect(selectNamespace).toHaveBeenCalledWith(tenantNamespace1);
    expect(window.location.pathname).toEqual(
      path.replace(':namespace', tenantNamespace1)
    );
  });
});
