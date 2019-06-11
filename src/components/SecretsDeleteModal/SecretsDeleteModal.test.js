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
import SecretsDeleteModal from './SecretsDeleteModal';

it('SecretsDeleteModal renders with passed secret id', () => {
  const props = {
    open: true,
    id: 'dummySecret',
    handleClick() {},
    handleDelete() {}
  };
  const { queryByText } = render(<SecretsDeleteModal {...props} />);
  expect(queryByText('dummySecret')).toBeTruthy();
  expect(queryByText('Cancel')).toBeTruthy();
  expect(queryByText('Delete')).toBeTruthy();
  expect(queryByText('Delete Secret')).toBeTruthy();
});

it('Test SecretsDeleteModal click events', () => {
  const handleClick = jest.fn();
  const handleDelete = jest.fn();
  const props = {
    open: true,
    id: 'dummySecret',
    handleClick,
    handleDelete
  };

  const { queryByText, rerender } = render(<SecretsDeleteModal {...props} />);
  fireEvent.click(queryByText('Delete'));
  expect(handleDelete).toHaveBeenCalledTimes(1);
  rerender(<SecretsDeleteModal open={false} />);
  fireEvent.click(queryByText('Delete'));
  expect(handleClick).toHaveBeenCalledTimes(0);
});
