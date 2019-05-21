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
import TooltipDropdown from './TooltipDropdown';

const props = {
  id: 'tooltip-dropdown-id',
  label: 'select an item',
  items: ['item 1', 'item 2', 'item 3'],
  loading: false
};

it('TooltipDropdown renders', () => {
  const { getByText, queryByText } = render(<TooltipDropdown {...props} />);
  expect(queryByText(/select an item/i)).toBeTruthy();
  fireEvent.click(getByText(/select an item/i));
  props.items.forEach(item => {
    const re = new RegExp(item, 'i');
    expect(queryByText(re)).toBeTruthy();
  });
  fireEvent.click(getByText(/item 1/i));
  expect(queryByText(/item 1/i)).toBeTruthy();
  expect(queryByText(/select an item/i)).toBeFalsy();
});

it('TooltipDropdown renders loading skeleton', () => {
  const { queryByText } = render(<TooltipDropdown {...props} loading />);
  expect(queryByText(/select an item/i)).toBeFalsy();
});

it('TooltipDropdown handles onChange event', () => {
  const onChange = jest.fn();
  const { getByText } = render(
    <TooltipDropdown {...props} onChange={onChange} />
  );
  fireEvent.click(getByText(/select an item/i));
  fireEvent.click(getByText(/item 1/i));
  expect(onChange).toHaveBeenCalledTimes(1);
});
