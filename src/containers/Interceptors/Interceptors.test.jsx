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

import { fireEvent } from '@testing-library/react';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import Interceptors from '.';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as InterceptorsAPI from '../../api/interceptors';

const interceptor = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'interceptor',
  metadata: {
    creationTimestamp: '2019-11-12T19:29:46Z',
    name: 'interceptor',
    namespace: 'default',
    uid: 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

describe('Interceptors', () => {
  beforeEach(() => {
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: 'default' } }]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: ALL_NAMESPACES
    }));
  });

  it('renders with no interceptors', () => {
    vi.spyOn(InterceptorsAPI, 'useInterceptors').mockImplementation(() => ({
      data: []
    }));

    const { getByText } = renderWithRouter(<Interceptors />, {
      path: '/interceptors',
      route: '/interceptors'
    });

    expect(getByText('Interceptors')).toBeTruthy();
    expect(getByText('No matching Interceptors found')).toBeTruthy();
  });

  it('renders with one interceptor', () => {
    vi.spyOn(InterceptorsAPI, 'useInterceptors').mockImplementation(() => ({
      data: [interceptor]
    }));

    const { queryByText } = renderWithRouter(<Interceptors />, {
      path: '/interceptors',
      route: '/interceptors'
    });

    expect(queryByText('Interceptors')).toBeTruthy();
    expect(queryByText('No matching Interceptors found')).toBeFalsy();
    expect(queryByText('interceptor')).toBeTruthy();
  });

  it('can be filtered on a single label filter', async () => {
    vi.spyOn(InterceptorsAPI, 'useInterceptors').mockImplementation(
      ({ filters }) => ({
        data: filters.length ? [] : [interceptor]
      })
    );

    const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
      <Interceptors />,
      { path: '/interceptors', route: '/interceptors' }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('interceptor')).toBeFalsy();
  });

  it('renders in loading state', () => {
    vi.spyOn(InterceptorsAPI, 'useInterceptors').mockImplementation(() => ({
      isLoading: true
    }));

    const { queryByText } = renderWithRouter(<Interceptors />, {
      path: '/interceptors',
      route: '/interceptors'
    });

    expect(queryByText(/interceptors/i)).toBeTruthy();
    expect(queryByText('No matching Interceptors found')).toBeFalsy();
    expect(queryByText('interceptor')).toBeFalsy();
  });

  it('renders in error state', () => {
    const error = 'fake_error_message';
    vi.spyOn(InterceptorsAPI, 'useInterceptors').mockImplementation(() => ({
      error
    }));

    const { queryByText } = renderWithRouter(<Interceptors />, {
      path: '/interceptors',
      route: '/interceptors'
    });

    expect(queryByText(error)).toBeTruthy();
  });
});
