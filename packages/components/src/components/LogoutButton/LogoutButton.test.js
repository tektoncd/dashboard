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
import { waitForElement } from 'react-testing-library';
import { renderWithRouter } from '../../utils/test';
import Logout from './LogoutButton';

it('Header renders logout button if on OpenShift', async () => {
  const mockedResponse = {
    headers: { get: () => 'text/plain' },
    ok: true,
    status: 200,
    text: () => Promise.resolve('')
  };
  const shouldDisplayLogoutTrueMock = jest
    .fn()
    .mockImplementation(() => mockedResponse);
  const logoutButton = (
    <Logout shouldDisplayLogout={shouldDisplayLogoutTrueMock} />
  );
  const { queryByText } = renderWithRouter(logoutButton);
  await waitForElement(() => queryByText(/log out/i));
});

it('Header does not render logout button if not on OpenShift', async () => {
  const shouldDisplayLogoutFalseMock = jest
    .fn()
    .mockImplementation(() => Promise.reject());
  const { queryByText } = renderWithRouter(
    <Logout shouldDisplayLogout={shouldDisplayLogoutFalseMock} />
  );
  expect(queryByText(/log out/i)).toBeFalsy();
});
