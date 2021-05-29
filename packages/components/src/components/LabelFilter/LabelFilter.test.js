/*
Copyright 2019-2021 The Tekton Authors
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
import { fireEvent, waitFor } from '@testing-library/react';

import LabelFilter from './LabelFilter';
import { render } from '../../utils/test';

it('LabelFilter renders', () => {
  const filter = 'tekton.dev/pipeline=demo-pipeline';
  const { queryByText } = render(<LabelFilter filters={[filter]} />);
  expect(queryByText(/Input a label filter/i)).not.toBeNull();
  expect(queryByText(filter.replace('=', ':'))).not.toBeNull();
});

it('LabelFilter renders error on empty filter', () => {
  const { getByText, queryByText } = render(<LabelFilter />);
  fireEvent.submit(getByText(/Input a label filter/i));
  expect(queryByText(/filters must be/i)).not.toBeNull();
});

it('LabelFilter handles adding a filter', () => {
  const filter = 'app:test';
  const handleAddFilter = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <LabelFilter handleAddFilter={handleAddFilter} />
  );
  fireEvent.change(getByPlaceholderText(/input a label filter/i), {
    target: { value: filter }
  });
  fireEvent.submit(getByText(/Input a label filter/i));
  expect(handleAddFilter).toHaveBeenCalledWith([filter.replace(':', '=')]);
});

it('LabelFilter displays notification if character length is over 63 characters for labelValue', async () => {
  const filter =
    'app:1234567890123456789012345678901234567890123456789012345678901234';
  const handleAddFilter = jest.fn();
  const { getByPlaceholderText, getByText, getByTitle, queryByText } = render(
    <LabelFilter handleAddFilter={handleAddFilter} />
  );
  fireEvent.change(getByPlaceholderText(/input a label filter/i), {
    target: { value: filter }
  });
  fireEvent.submit(getByText(/Input a label filter/i));
  expect(handleAddFilter).not.toHaveBeenCalled();
  await waitFor(() =>
    getByText(
      /Filters must be of the format labelKey:labelValue and contain less than 64 characters/i
    )
  );
  fireEvent.click(getByTitle(/closes notification/i));
  expect(
    queryByText(
      /Filters must be of the format labelKey:labelValue and contain less than 64 characters/i
    )
  ).toBeNull();
});

it('LabelFilter handles adding a duplicate filter', async () => {
  const filter = 'app=test';
  const filterDisplayValue = 'app:test';
  const handleAddFilter = jest.fn();
  const { getByPlaceholderText, getByText, getByTitle, queryByText } = render(
    <LabelFilter filters={[filter]} handleAddFilter={handleAddFilter} />
  );
  fireEvent.change(getByPlaceholderText(/input a label filter/i), {
    target: { value: filterDisplayValue }
  });
  fireEvent.submit(getByText(/Input a label filter/i));
  expect(handleAddFilter).not.toHaveBeenCalled();
  await waitFor(() => getByText(/no duplicate filters allowed/i));
  fireEvent.click(getByTitle(/closes notification/i));
  expect(queryByText(/no duplicate filters allowed/i)).toBeNull();
});

it('LabelFilter handles deleting a filter', () => {
  const filter = 'tekton.dev/pipeline=demo-pipeline';
  const handleDeleteFilter = jest.fn();
  const { getByText } = render(
    <LabelFilter filters={[filter]} handleDeleteFilter={handleDeleteFilter} />
  );
  fireEvent.click(getByText(filter.replace('=', ':')));
  expect(handleDeleteFilter).toHaveBeenCalledWith(filter);
});

it('LabelFilter handles clearing all filters', () => {
  const filter = 'tekton.dev/pipeline=demo-pipeline';
  const handleClearFilters = jest.fn();
  const { getByText } = render(
    <LabelFilter filters={[filter]} handleClearFilters={handleClearFilters} />
  );
  fireEvent.click(getByText(/clear all/i));
  expect(handleClearFilters).toHaveBeenCalled();
});
