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

import AccessTokenType from './AccessTokenType';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const store = mockStore({});

it('AccessTokenType renders with blank inputs', () => {
  const props = {
    accessToken: '',
    handleChangeTextInput() {},
    invalidFields: {},
    loading: false
  };
  const { getByLabelText, getAllByDisplayValue } = renderWithIntl(
    <Provider store={store}>
      <AccessTokenType {...props} />
    </Provider>
  );
  expect(getByLabelText(/Access Token/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(1);
});

it('AccessTokenType incorrect fields', () => {
  const props = {
    accessToken: '',
    handleChangeTextInput() {},
    loading: false,
    invalidFields: { accessToken: true }
  };
  const { getByLabelText } = renderWithIntl(
    <Provider store={store}>
      <AccessTokenType {...props} />
    </Provider>
  );

  const accessTokenInput = getByLabelText(/Access Token/i);

  expect(accessTokenInput.getAttribute('data-invalid')).toBeTruthy();
});

it('AccessTokenType disabled when loading', () => {
  const props = {
    accessToken: '',
    handleChangeTextInput() {},
    loading: true,
    invalidFields: {}
  };
  const { getByLabelText } = renderWithIntl(
    <Provider store={store}>
      <AccessTokenType {...props} />
    </Provider>
  );

  const accessTokenInput = getByLabelText(/Access Token/i);

  expect(accessTokenInput.disabled).toBeTruthy();
});
