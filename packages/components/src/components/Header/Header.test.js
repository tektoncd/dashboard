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

import { renderWithRouter } from '../../utils/test';

import Header from './Header';

describe('Header', () => {
  it('renders with default content', () => {
    renderWithRouter(<Header />);
  });

  it('renders the logout button', () => {
    const logoutButton = 'log out';
    const { getByText } = renderWithRouter(
      <Header logoutButton={logoutButton} />
    );
    expect(getByText(/log out/i)).toBeTruthy();
  });

  it('renders the header menu button', () => {
    const onHeaderMenuButtonClick = jest.fn();
    const { getByTitle } = renderWithRouter(
      <Header onHeaderMenuButtonClick={onHeaderMenuButtonClick} />
    );
    fireEvent.click(getByTitle(/open menu/i));
    expect(onHeaderMenuButtonClick).toHaveBeenCalled();
  });
});
