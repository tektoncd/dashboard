/*
Copyright 2019-2021 The Tekton Authors
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
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import TriggerTemplates from '.';
import * as API from '../../api';
import * as APIUtils from '../../api/utils';
import * as TriggerTemplatesAPI from '../../api/triggerTemplates';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const triggerTemplate = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'TriggerTemplate',
  metadata: {
    creationTimestamp: '2019-11-12T19:29:46Z',
    name: 'trigger-template',
    namespace: 'default',
    uid: 'c930f02e-0582-11ea-8c1f-025765432111'
  }
};

const namespaces = ['default'];

it('TriggerTemplates renders with no templates', () => {
  jest
    .spyOn(TriggerTemplatesAPI, 'useTriggerTemplates')
    .mockImplementation(() => ({ data: [] }));

  jest
    .spyOn(API, 'useNamespaces')
    .mockImplementation(() => ({ data: namespaces }));
  jest
    .spyOn(APIUtils, 'useSelectedNamespace')
    .mockImplementation(() => ({ selectedNamespace: ALL_NAMESPACES }));
  const store = mockStore({
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText('TriggerTemplates')).toBeTruthy();
  expect(queryByText('No matching TriggerTemplates found')).toBeTruthy();
});

it('TriggerTemplates renders with one template', () => {
  jest
    .spyOn(TriggerTemplatesAPI, 'useTriggerTemplates')
    .mockImplementation(() => ({ data: [triggerTemplate] }));

  const store = mockStore({
    namespaces,
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText(/TriggerTemplates/i)).toBeTruthy();
  expect(queryByText('No matching TriggerTemplates found')).toBeFalsy();
  expect(queryByText('trigger-template')).toBeTruthy();
});

it('TriggerTemplates can be filtered on a single label filter', async () => {
  jest
    .spyOn(TriggerTemplatesAPI, 'useTriggerTemplates')
    .mockImplementation(({ filters }) => ({
      data: filters.length ? [] : [triggerTemplate]
    }));

  const store = mockStore({
    namespaces,
    notifications: {}
  });

  const { queryByText, getByPlaceholderText, getByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  const filterValue = 'baz:bam';
  const filterInputField = getByPlaceholderText(/Input a label filter/);
  fireEvent.change(filterInputField, { target: { value: filterValue } });
  fireEvent.submit(getByText(/Input a label filter/i));

  expect(queryByText(filterValue)).toBeTruthy();
  expect(queryByText('trigger-template')).toBeFalsy();
});

it('TriggerTemplates renders in loading state', () => {
  jest
    .spyOn(TriggerTemplatesAPI, 'useTriggerTemplates')
    .mockImplementation(() => ({ isLoading: true }));

  const store = mockStore({
    namespaces,
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText(/TriggerTemplates/i)).toBeTruthy();
  expect(queryByText('No matching TriggerTemplates found')).toBeFalsy();
});

it('TriggerTemplates renders in error state', () => {
  const error = 'fake_error_message';
  jest
    .spyOn(TriggerTemplatesAPI, 'useTriggerTemplates')
    .mockImplementation(() => ({ error }));

  const store = mockStore({
    namespaces,
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route
        path="/triggerTemplates"
        render={props => <TriggerTemplates {...props} />}
      />
    </Provider>,
    { route: '/triggerTemplates' }
  );

  expect(queryByText(error)).toBeTruthy();
});
