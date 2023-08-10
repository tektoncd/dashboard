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

import React from 'react';
import { fireEvent } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import HeaderBarContent from './HeaderBarContent';

describe('HeaderBarContent', () => {
  it('selects namespace based on URL', () => {
    const namespace = 'default';
    const selectNamespace = jest.fn();
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: null, selectNamespace }));
    const path = '/namespaces/:namespace/foo';
    renderWithRouter(<HeaderBarContent />, {
      path,
      route: `/namespaces/${namespace}/foo`
    });
    expect(selectNamespace).toHaveBeenCalledWith(namespace);
  });

  it('adds namespace to URL when selected', async () => {
    const otherNamespace = 'foo';
    const path = '/fake/path';
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: otherNamespace } }]
    }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      namespacedMatch: { path },
      selectedNamespace: ALL_NAMESPACES,
      selectNamespace: () => {}
    }));
    jest.spyOn(window.history, 'pushState');
    const { getByText, getByDisplayValue } = renderWithRouter(
      <HeaderBarContent />,
      { path, route: path }
    );
    fireEvent.click(getByDisplayValue(/All Namespaces/i));
    fireEvent.click(getByText(otherNamespace));
    expect(window.history.pushState).toHaveBeenCalledWith(
      expect.anything(),
      null,
      `/namespaces/${otherNamespace}${path}`
    );
  });

  it('updates namespace in URL', async () => {
    const namespace = 'default';
    const otherNamespace = 'foo';
    const path = '/namespaces/:namespace/fake/path';
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [
        { metadata: { name: namespace } },
        { metadata: { name: otherNamespace } }
      ]
    }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      namespacedMatch: { path, params: { namespace } },
      selectedNamespace: namespace,
      selectNamespace: () => {}
    }));
    const selectNamespace = jest.fn();
    jest.spyOn(window.history, 'pushState');
    const { getByText, getByDisplayValue } = renderWithRouter(
      <HeaderBarContent />,
      { path, route: `/namespaces/${namespace}/fake/path` }
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(otherNamespace));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(window.history.pushState).toHaveBeenCalledWith(
      expect.anything(),
      null,
      `/namespaces/${otherNamespace}/fake/path`
    );
  });

  it('removes namespace from URL when ALL_NAMESPACES is selected', async () => {
    const namespace = 'default';
    const path = '/namespaces/:namespace/fake/path';
    const selectNamespace = jest.fn();
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: namespace } }]
    }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      namespacedMatch: { path, params: { namespace } },
      selectedNamespace: namespace,
      selectNamespace
    }));
    jest.spyOn(window.history, 'pushState');
    const { getByText, getByDisplayValue } = renderWithRouter(
      <HeaderBarContent />,
      {
        path,
        route: `/namespaces/${namespace}/fake/path`
      }
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(/All Namespaces/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(window.history.pushState).toHaveBeenCalledWith(
      expect.anything(),
      null,
      '/fake/path'
    );
  });

  it('removes namespace from URL when clearing selection', async () => {
    const namespace = 'default';
    const path = '/namespaces/:namespace/fake/path';
    const selectNamespace = jest.fn();
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: namespace } }]
    }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      namespacedMatch: { path, params: { namespace } },
      selectedNamespace: namespace,
      selectNamespace
    }));
    jest.spyOn(window.history, 'pushState');
    const { getByTitle } = renderWithRouter(<HeaderBarContent />, {
      path,
      route: `/namespaces/${namespace}/fake/path`
    });
    fireEvent.click(getByTitle(/clear selected item/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(window.history.pushState).toHaveBeenCalledWith(
      expect.anything(),
      null,
      '/fake/path'
    );
  });

  it('does not render namespaces dropdown in single namespace visibility mode', () => {
    const namespace = 'default';
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    jest.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: namespace } }]
    }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: namespace
    }));
    const logoutButton = 'fake_logoutButton';
    const { queryByPlaceholderText, queryByText } = renderWithRouter(
      <HeaderBarContent logoutButton={logoutButton} />
    );
    expect(queryByText(logoutButton)).toBeTruthy();
    expect(queryByPlaceholderText(/select namespace/i)).toBeFalsy();
  });
});
