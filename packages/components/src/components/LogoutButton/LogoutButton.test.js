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
import { waitForElement } from '@testing-library/react';
import { renderWithRouter } from '../../utils/test';
import Logout from './LogoutButton';

it('Header renders logout button when logout url is set', async () => {
  const mockedResponse = Promise.resolve('/blabla');

  const getLogoutURLMock = jest.fn().mockImplementation(() => mockedResponse);
  const logoutButton = <Logout getLogoutURL={getLogoutURLMock} />;
  const { queryByTitle } = renderWithRouter(logoutButton);
  await waitForElement(() => queryByTitle(/log out/i));
});

it('Header renders logout button when logout url is not set', async () => {
  const mockedResponse = Promise.resolve(null);

  const getLogoutURLMock = jest.fn().mockImplementation(() => mockedResponse);
  const { queryByText } = renderWithRouter(
    <Logout getLogoutURL={getLogoutURLMock} />
  );
  expect(queryByText(/log out/i)).toBeFalsy();
});

it('Header does not render logout button when promise for getting properties is rejected', async () => {
  const getLogoutURLMock = jest.fn().mockImplementation(() => Promise.reject());
  const { queryByText } = renderWithRouter(
    <Logout getLogoutURL={getLogoutURLMock} />
  );
  expect(queryByText(/log out/i)).toBeFalsy();
});
