/*
Copyright 2019 The Tekton Authors
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
import { fireEvent, render } from 'react-testing-library';
import BasicAuthFields from './BasicAuthFields';

it('BasicAuthFields renders with blank inputs', () => {
  const props = {
    username: '',
    password: '',
    serviceAccount: '',
    handleChange: function() {},
    accessTo: '',
    invalidFields: []
  };
  const { getByLabelText, getAllByDisplayValue } = render(<BasicAuthFields {...props} />);
  expect(getByLabelText(/Username/i)).toBeTruthy();
  expect(getByLabelText(/Password\/Token/i)).toBeTruthy();
  expect(getByLabelText(/Service Account/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length === 3).toBeTruthy();
});

it('BasicAuthFields shows disabled fields', () => {
  const props = {
    username: '',
    password: '',
    serviceAccount: '',
    handleChange: function() {},
    accessTo: 'git',
    invalidFields: []
  };
  const { getByDisplayValue } = render(<BasicAuthFields {...props} />);

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const serviceAccountInput = document.getElementById('serviceAccount');

  expect(usernameInput.disabled).toBeFalsy();
  expect(passwordInput.disabled).toBeTruthy();
  expect(serviceAccountInput.disabled).toBeTruthy();
});

it('BasicAuthFields incorrect fields', () => {
  const props = {
    username: 'text',
    password: 'text',
    serviceAccount: '',
    handleChange: function() {},
    accessTo: '',
    invalidFields: ['username', 'password']
  };
  const {} = render(<BasicAuthFields {...props} />);

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const serviceAccountInput = document.getElementById('serviceAccount');

  expect(usernameInput.getAttribute('data-invalid')).toBeTruthy();
  expect(passwordInput.getAttribute('data-invalid')).toBeTruthy();
  expect(serviceAccountInput.getAttribute('data-invalid')).toBeFalsy();
});
