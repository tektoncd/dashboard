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
import { fireEvent } from 'react-testing-library';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { renderWithIntl, rerenderWithIntl } from '../../../utils/test';
import Form from './index';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const namespaces = {
  byName: {
    default: {
      metadata: {
        name: 'default',
        selfLink: '/api/v1/namespaces/default',
        uid: '32b35d3b-6ce1-11e9-af21-025000000001',
        resourceVersion: '4',
        creationTimestamp: '2019-05-02T13:50:08Z'
      }
    }
  },
  errorMessage: null,
  isFetching: false,
  selected: 'default'
};

const store = mockStore({
  namespaces,
  properties: {}
});

const props = {
  annotations: [
    {
      access: 'git',
      value: 'https://github.com',
      id: `annotation0-fdsh`
    }
  ],
  name: '',
  namespace: '',
  accessToken: '',
  username: '',
  password: '',
  invalidFields: {},
  secretType: '',
  errorMessageDuplicate: null,
  loading: false,
  handleClose() {},
  submit() {},
  handleChangeTextInput() {},
  handleChangeNamespace() {},
  handleSecretType: jest.fn(),
  handleAnnotationChange() {},
  handleAdd() {},
  handleRemove() {},
  errorMessageCreated: null,
  removeDuplicateErrorMessage() {}
};

it('Form renders with universal fields only', () => {
  const {
    queryByLabelText,
    getAllByDisplayValue,
    queryByPlaceholderText
  } = renderWithIntl(
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );
  expect(queryByLabelText(/Name/i)).toBeTruthy();
  expect(queryByLabelText(/Namespace/i)).toBeTruthy();
  expect(queryByLabelText(/Username/i)).toBeFalsy();
  // access token
  expect(queryByPlaceholderText('********')).toBeFalsy();
  // password
  expect(queryByPlaceholderText('*******')).toBeFalsy();
  expect(queryByPlaceholderText(/github/)).toBeFalsy();
  expect(getAllByDisplayValue('').length).toEqual(2);
});

it('Form show Password fields when radio button clicked', async () => {
  const {
    queryByLabelText,
    getAllByDisplayValue,
    queryByPlaceholderText,
    rerender
  } = renderWithIntl(
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );
  expect(queryByLabelText(/Name/i)).toBeTruthy();
  expect(queryByLabelText(/Namespace/i)).toBeTruthy();
  expect(queryByLabelText(/Username/i)).toBeFalsy();
  // access token
  expect(queryByPlaceholderText('*********')).toBeFalsy();
  // password
  expect(queryByPlaceholderText('********')).toBeFalsy();
  expect(queryByPlaceholderText(/github/)).toBeFalsy();
  expect(getAllByDisplayValue('').length).toEqual(2);

  fireEvent.click(queryByLabelText('Password'));
  expect(props.handleSecretType).toHaveBeenCalledTimes(1);

  props.secretType = 'password';

  rerenderWithIntl(
    rerender,
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );

  expect(queryByLabelText(/Username/i)).toBeTruthy();
  // password
  expect(queryByPlaceholderText('********')).toBeTruthy();
  expect(queryByPlaceholderText(/github/)).toBeTruthy();
  // access token
  expect(queryByPlaceholderText('*********')).toBeFalsy();
  expect(getAllByDisplayValue('').length).toEqual(4);
});

it('Form show access token fields when radio button clicked', async () => {
  props.secretType = '';

  const {
    queryByLabelText,
    getAllByDisplayValue,
    queryByPlaceholderText,
    rerender
  } = renderWithIntl(
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );

  expect(queryByLabelText(/Name/i)).toBeTruthy();
  expect(queryByLabelText(/Namespace/i)).toBeTruthy();
  expect(queryByLabelText(/Username/i)).toBeFalsy();
  // access token
  expect(queryByPlaceholderText('*********')).toBeFalsy();
  // password
  expect(queryByPlaceholderText('********')).toBeFalsy();
  expect(queryByPlaceholderText(/github/)).toBeFalsy();
  expect(getAllByDisplayValue('').length).toEqual(2);

  fireEvent.click(queryByLabelText('Access Token'));
  expect(props.handleSecretType).toHaveBeenCalledTimes(1);

  props.secretType = 'accessToken';

  rerenderWithIntl(
    rerender,
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );

  expect(queryByLabelText(/Username/i)).toBeFalsy();
  // password
  expect(queryByPlaceholderText('********')).toBeFalsy();
  expect(queryByPlaceholderText(/github/)).toBeFalsy();
  // access token
  expect(queryByPlaceholderText('*********')).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(3);
});

it('Form shows error notification', async () => {
  props.secretType = '';
  props.errorMessageDuplicate = 'Secret already exists';

  const { queryByText } = renderWithIntl(
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );

  expect(queryByText(/Secret already exists/i)).toBeTruthy();
});

it('Form disabled when loading', () => {
  props.loading = true;
  props.errorMessageDuplicate = null;

  const { getByLabelText, queryByText } = renderWithIntl(
    <Provider store={store}>
      <Form {...props} />
    </Provider>
  );

  const nameInput = getByLabelText(/name/i);
  const namespaceDropdown = getByLabelText(/namespace/i);
  const cancelButton = queryByText(/Cancel/i);
  const createButton = queryByText('Create');

  expect(nameInput.disabled).toBeTruthy();
  expect(namespaceDropdown.disabled).toBeTruthy();
  expect(cancelButton.disabled).toBeTruthy();
  expect(createButton.disabled).toBeTruthy();
});
