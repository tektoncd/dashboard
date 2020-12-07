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
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import SecretsDeleteModal from './SecretsDeleteModal';

it('SecretsDeleteModal renders with one passed secret', () => {
  const props = {
    open: true,
    toBeDeleted: [{ name: 'secret-name', namespace: 'default' }],
    handleClick() {},
    handleDelete() {}
  };
  const { queryByText } = renderWithIntl(<SecretsDeleteModal {...props} />);
  expect(queryByText('secret-name')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Delete')).toBeTruthy();
  expect(queryByText('Delete Secret')).toBeTruthy();
});

it('SecretsDeleteModal renders with multiple passed secrets', () => {
  const props = {
    open: true,
    toBeDeleted: [
      { name: 'secret-name', namespace: 'default' },
      { name: 'other-secret', namespace: 'default' },
      { name: 'another-one', namespace: 'default' }
    ],
    handleClick() {},
    handleDelete() {}
  };
  const { queryByText } = renderWithIntl(<SecretsDeleteModal {...props} />);
  expect(queryByText('secret-name')).toBeTruthy();
  expect(queryByText('other-secret')).toBeTruthy();
  expect(queryByText('another-one')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Delete')).toBeTruthy();
  expect(queryByText('Delete Secret')).toBeTruthy();
});

it('Test SecretsDeleteModal click events', () => {
  const handleClick = jest.fn();
  const handleDelete = jest.fn();
  const props = {
    open: true,
    toBeDeleted: [{ name: 'secret-name', namespace: 'default' }],
    handleClick,
    handleDelete
  };

  const { queryByText, rerender } = renderWithIntl(
    <SecretsDeleteModal {...props} />
  );
  fireEvent.click(queryByText('Delete'));
  expect(handleDelete).toHaveBeenCalledTimes(1);
  renderWithIntl(<SecretsDeleteModal {...props} open={false} />, { rerender });
  fireEvent.click(queryByText('Delete'));
  expect(handleClick).toHaveBeenCalledTimes(0);
});
