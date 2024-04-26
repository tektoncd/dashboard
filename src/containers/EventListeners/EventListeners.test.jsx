/*
Copyright 2019-2024 The Tekton Authors
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
import EventListeners from '.';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as EventListenersAPI from '../../api/eventListeners';

const eventListener = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'EventListener',
  metadata: {
    creationTimestamp: '2019-11-12T19:29:46Z',
    name: 'event-listener',
    namespace: 'default',
    uid: 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

describe('EventListeners', () => {
  beforeEach(() => {
    vi.spyOn(API, 'useNamespaces').mockImplementation(() => ({
      data: [{ metadata: { name: 'default' } }]
    }));
    vi.spyOn(APIUtils, 'useSelectedNamespace').mockImplementation(() => ({
      selectedNamespace: ALL_NAMESPACES
    }));
  });

  it('renders with no bindings', () => {
    vi.spyOn(EventListenersAPI, 'useEventListeners').mockImplementation(() => ({
      data: []
    }));

    const { getByText } = renderWithRouter(<EventListeners />, {
      path: '/eventlisteners',
      route: '/eventlisteners'
    });

    expect(getByText('EventListeners')).toBeTruthy();
    expect(getByText('No matching EventListeners found')).toBeTruthy();
  });

  it('renders with one binding', () => {
    vi.spyOn(EventListenersAPI, 'useEventListeners').mockImplementation(() => ({
      data: [eventListener]
    }));

    const { queryByText, queryByTitle } = renderWithRouter(<EventListeners />, {
      path: '/eventlisteners',
      route: '/eventlisteners'
    });

    expect(queryByText('EventListeners')).toBeTruthy();
    expect(queryByText('No matching EventListeners found')).toBeFalsy();
    expect(queryByText('event-listener')).toBeTruthy();
    expect(queryByTitle('event-listener')).toBeTruthy();
  });

  it('can be filtered on a single label filter', async () => {
    vi.spyOn(EventListenersAPI, 'useEventListeners').mockImplementation(
      ({ filters }) => ({
        data: filters.length ? [] : [eventListener]
      })
    );

    const { getByPlaceholderText, getByText, queryByText } = renderWithRouter(
      <EventListeners />,
      { path: '/eventlisteners', route: '/eventlisteners' }
    );

    const filterValue = 'baz:bam';
    const filterInputField = getByPlaceholderText(/Input a label filter/);
    fireEvent.change(filterInputField, { target: { value: filterValue } });
    fireEvent.submit(getByText(/Input a label filter/i));

    expect(queryByText(filterValue)).toBeTruthy();
    expect(queryByText('event-listeners')).toBeFalsy();
  });

  it('renders in loading state', () => {
    vi.spyOn(EventListenersAPI, 'useEventListeners').mockImplementation(() => ({
      isLoading: true
    }));

    const { queryByText } = renderWithRouter(<EventListeners />, {
      path: '/eventlisteners',
      route: '/eventlisteners'
    });

    expect(queryByText(/EventListeners/i)).toBeTruthy();
    expect(queryByText('No matching EventListeners found')).toBeFalsy();
    expect(queryByText('event-listeners')).toBeFalsy();
  });

  it('renders in error state', () => {
    const error = 'fake_error_message';
    vi.spyOn(EventListenersAPI, 'useEventListeners').mockImplementation(() => ({
      error
    }));

    const { queryByText } = renderWithRouter(<EventListeners />, {
      path: '/eventlisteners',
      route: '/eventlisteners'
    });

    expect(queryByText(error)).toBeTruthy();
  });
});
