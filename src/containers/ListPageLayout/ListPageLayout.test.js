/*
Copyright 2020-2021 The Tekton Authors
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
import { ListPageLayout } from './ListPageLayout';

describe('ListPageLayout', () => {
  it('add namespace to URL when selected', async () => {
    const otherNamespace = 'foo';
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: [otherNamespace] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
    const history = {
      push: jest.fn()
    };
    const path = '/fake/path';
    const match = { path };
    const selectNamespace = jest.fn();
    const { getByText, getByDisplayValue } = renderWithRouter(
      <ListPageLayout
        history={history}
        location={{ search: '' }}
        match={match}
        namespace={ALL_NAMESPACES}
        selectNamespace={selectNamespace}
      />
    );
    fireEvent.click(getByDisplayValue(/All Namespaces/i));
    fireEvent.click(getByText(otherNamespace));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith(
      `/namespaces/${otherNamespace}${path}`
    );
  });

  it('updates namespace in URL', async () => {
    const namespace = 'default';
    const otherNamespace = 'foo';
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: [namespace, otherNamespace] }));
    jest
      .spyOn(APIUtils, 'useSelectedNamespace')
      .mockImplementation(() => ({ selectedNamespace: namespace }));
    const history = {
      push: jest.fn()
    };
    const path = '/namespaces/:namespace/fake/path';
    const match = { path, params: { namespace } };
    const selectNamespace = jest.fn();
    const { getByText, getByDisplayValue } = renderWithRouter(
      <ListPageLayout
        history={history}
        location={{ search: '' }}
        match={match}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(otherNamespace));
    expect(selectNamespace).not.toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith(
      `/namespaces/${otherNamespace}/fake/path`
    );
  });

  it('removes namespace from URL when ALL_NAMESPACES is selected', async () => {
    const namespace = 'default';
    const selectNamespace = jest.fn();
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: [namespace] }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: namespace,
      selectNamespace
    }));
    const history = {
      push: jest.fn()
    };
    const path = '/namespaces/:namespace/fake/path';
    const match = { path, params: { namespace } };
    const { getByText, getByDisplayValue } = renderWithRouter(
      <ListPageLayout
        history={history}
        location={{ search: '' }}
        match={match}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    );
    fireEvent.click(getByDisplayValue(namespace));
    fireEvent.click(getByText(/All Namespaces/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(history.push).toHaveBeenCalledWith(`/fake/path`);
  });

  it('removes namespace from URL when clearing selection', async () => {
    const namespace = 'default';
    const selectNamespace = jest.fn();
    jest
      .spyOn(API, 'useNamespaces')
      .mockImplementation(() => ({ data: [namespace] }));
    jest.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: namespace,
      selectNamespace
    }));
    const history = {
      push: jest.fn()
    };
    const path = '/namespaces/:namespace/fake/path';
    const match = { path, params: { namespace } };
    const { getByTitle } = renderWithRouter(
      <ListPageLayout
        history={history}
        location={{ search: '' }}
        match={match}
        namespace={namespace}
        selectNamespace={selectNamespace}
      />
    );
    fireEvent.click(getByTitle(/clear selected item/i));
    expect(selectNamespace).toHaveBeenCalledWith(ALL_NAMESPACES);
    expect(history.push).toHaveBeenCalledWith(`/fake/path`);
  });

  it('does not render namespaces dropdown in single namespace visibility mode', () => {
    jest.spyOn(API, 'useTenantNamespace').mockImplementation(() => 'fake');
    const { queryByPlaceholderText } = renderWithRouter(
      <ListPageLayout tenantNamespace="fake" />
    );
    expect(queryByPlaceholderText(/select namespace/i)).toBeFalsy();
  });

  it('does not render namespaces dropdown when hideNamespacesDropdown is true', () => {
    const { queryByPlaceholderText } = renderWithRouter(
      <ListPageLayout hideNamespacesDropdown />
    );
    expect(queryByPlaceholderText(/select namespace/i)).toBeFalsy();
  });

  it('does not render LabelFilter input by default', () => {
    const { queryByLabelText } = renderWithRouter(<ListPageLayout />);
    expect(queryByLabelText(/Input a label filter/i)).toBeFalsy();
  });

  it('renders LabelFilter input when filters prop is provided', () => {
    const { getAllByLabelText } = renderWithRouter(
      <ListPageLayout filters={[]} />
    );
    expect(getAllByLabelText(/Input a label filter/i)[0]).toBeTruthy();
  });
});
