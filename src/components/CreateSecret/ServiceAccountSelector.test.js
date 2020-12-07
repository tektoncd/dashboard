/*
Copyright 2019-2020 The Tekton Authors
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
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import ServiceAccountSelector from './ServiceAccountSelector';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const serviceAccounts = [
  {
    metadata: {
      name: 'service-account-1',
      namespace: 'blue'
    }
  },
  {
    metadata: {
      name: 'service-account-2',
      namespace: 'green'
    }
  },
  {
    metadata: {
      name: 'service-account-3',
      namespace: 'blue'
    }
  }
];

const store = mockStore({});

const patchSecret = jest.fn();

const props = {
  loading: false,
  name: 'some-secret',
  namespace: 'blue',
  serviceAccounts,
  patchSecret,
  errorMessagePatched: null,
  handleClose() {}
};

it('ServiceAccountSelector shows correct SA from selected namespace', () => {
  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <ServiceAccountSelector {...props} />
    </Provider>
  );

  expect(queryByText('Successfully created some-secret')).toBeTruthy();
  expect(queryByText('service-account-1')).toBeTruthy();
  expect(queryByText('service-account-2')).toBeFalsy();
  expect(queryByText('service-account-3')).toBeTruthy();
});

it('ServiceAccountSelector patch method passes correct selected SA', () => {
  const { queryByText, queryAllByLabelText } = renderWithIntl(
    <Provider store={store}>
      <ServiceAccountSelector {...props} />
    </Provider>
  );

  fireEvent.click(queryAllByLabelText('Select row')[0]);
  expect(queryByText('1 item selected')).toBeTruthy();
  fireEvent.click(queryByText('Patch'));
  expect(patchSecret).toHaveBeenCalledWith(
    [
      {
        name: 'service-account-1',
        namespace: 'blue'
      }
    ],
    props.name,
    props.handleClose
  );
});

it('ServiceAccountSelector patch method passes correct selected SAs', () => {
  const { queryByText, queryByLabelText } = renderWithIntl(
    <Provider store={store}>
      <ServiceAccountSelector {...props} />
    </Provider>
  );

  fireEvent.click(queryByLabelText('Select all rows'));
  expect(queryByText('2 items selected')).toBeTruthy();
  fireEvent.click(queryByText('Patch'));
  expect(patchSecret).toHaveBeenCalledWith(
    [
      {
        name: 'service-account-1',
        namespace: 'blue'
      },
      {
        name: 'service-account-3',
        namespace: 'blue'
      }
    ],
    props.name,
    props.handleClose
  );
});

it('ServiceAccountSelector shows error notification', () => {
  props.errorMessagePatched = 'Something went wrong';

  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <ServiceAccountSelector {...props} />
    </Provider>
  );

  expect(queryByText('Something went wrong')).toBeTruthy();
});
