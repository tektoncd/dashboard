/*
Copyright 2019-2026 The Tekton Authors
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

import { waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import Logout from './LogoutButton';

it('Header renders logout button when logout url is set', async () => {
  vi.spyOn(API, 'useLogoutURL').mockImplementation(() => '/logout');
  const logoutButton = <Logout />;
  const { queryByTitle } = renderWithRouter(logoutButton);
  await waitFor(() => queryByTitle(/log out/i));
});

it('Header does not render logout button when logout url is not set', async () => {
  vi.spyOn(API, 'useLogoutURL').mockImplementation(() => undefined);
  const { queryByText } = renderWithRouter(<Logout />);
  expect(queryByText(/log out/i)).toBeFalsy();
});
