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
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import PasswordType from './PasswordType';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const store = mockStore({});

it('PasswordType renders with blank inputs', () => {
  const props = {
    password: '',
    username: '',
    handleChangeTextInput() {},
    invalidFields: {},
    loading: false
  };
  const { getByLabelText, getAllByDisplayValue } = renderWithIntl(
    <Provider store={store}>
      <PasswordType {...props} />
    </Provider>
  );
  expect(getByLabelText(/Username/i)).toBeTruthy();
  expect(getByLabelText(/Password/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(2);
});

it('PasswordType incorrect fields', () => {
  const props = {
    password: '',
    username: '',
    handleChangeTextInput() {},
    invalidFields: { password: true, username: true },
    loading: false
  };
  const { getByLabelText } = renderWithIntl(
    <Provider store={store}>
      <PasswordType {...props} />
    </Provider>
  );

  const usernameInput = getByLabelText(/username/i);
  const passwordInput = getByLabelText(/password/i);

  expect(usernameInput.getAttribute('data-invalid')).toBeTruthy();
  expect(passwordInput.getAttribute('data-invalid')).toBeTruthy();
});

it('PasswordType disabled when loading', () => {
  const props = {
    password: '',
    username: '',
    handleChangeTextInput() {},
    invalidFields: {},
    loading: true
  };
  const { getByLabelText } = renderWithIntl(
    <Provider store={store}>
      <PasswordType {...props} />
    </Provider>
  );

  const usernameInput = getByLabelText(/username/i);
  const passwordInput = getByLabelText(/password/i);

  expect(usernameInput.disabled).toBeTruthy();
  expect(passwordInput.disabled).toBeTruthy();
});
