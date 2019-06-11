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
import SecretsTable from './SecretsTable';

it('SecretsTable renders with no secrets', () => {
  const props = {
    handleDelete() {},
    handleNew() {},
    loading: false,
    secrets: []
  };
  const { getAllByText, queryByText } = render(<SecretsTable {...props} />);
  expect(queryByText(/Secret/i)).toBeTruthy();
  expect(queryByText(/Annotations/i)).toBeTruthy();
  expect(getAllByText('-').length).toEqual(3);
});

it('SecretsTable renders with one secret', () => {
  const props = {
    handleDelete() {},
    handleNew() {},
    loading: false,
    secrets: [
      {
        annotations: { 'tekton.dev/git-0': 'https://github.ibm.com' },
        name: 'dummySecret',
        uid: '0'
      }
    ]
  };
  const { queryByText } = render(<SecretsTable {...props} />);
  expect(queryByText(/dummySecret/i)).toBeTruthy();
  expect(
    queryByText(/tekton.dev\/git-0: https:\/\/github.ibm.com/i)
  ).toBeTruthy();
});

it('SecretsTable renders in loading state', () => {
  const props = {
    handleDelete() {},
    handleNew() {},
    loading: true,
    secrets: []
  };
  const { queryByText } = render(<SecretsTable {...props} />);
  expect(queryByText(/Secret/i)).toBeFalsy();
  expect(queryByText(/Annotations/i)).toBeFalsy();
});

it('SecretsTable delete click handler', () => {
  const handleDelete = jest.fn();
  const props = {
    handleDelete,
    handleNew() {},
    loading: false,
    secrets: [
      {
        annotations: { 'tekton.dev/git-0': 'https://github.ibm.com' },
        name: 'dummySecret',
        uid: '0'
      }
    ]
  };
  const { getByTestId } = render(<SecretsTable {...props} />);
  fireEvent.click(getByTestId('deleteIcon'));
  expect(handleDelete).toHaveBeenCalledTimes(1);
});
