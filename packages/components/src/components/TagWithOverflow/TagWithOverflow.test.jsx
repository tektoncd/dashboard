/*
Copyright 2019-2024 The Tekton Authors
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

import { fireEvent, within } from '@testing-library/react';
import { renderWithRouter } from '../../utils/test';
import CustomTags from './TagWithOverflow';

const labels = {
  tag1: 'value1',
  tag2: 'value2',
  tag3: 'value3',
  tag4: 'value4',
  tag5: 'value5',
  tag6: 'value6',
  tag7: 'value7',
  tag8: 'value8',
  tag9: 'value9',
  tag10: 'value10'
};

const namespace = 'default';

describe('CustomTags with overflow', () => {
  it('renders visible tags', () => {
    const { getByText } = renderWithRouter(
      <CustomTags labels={labels} namespace={namespace} />
    );
    expect(getByText('tag1: value1')).toBeTruthy();
    expect(getByText('tag2: value2')).toBeTruthy();
  });

  it('renders overflow tags with popover', () => {
    const { getByText } = renderWithRouter(
      <CustomTags labels={labels} namespace={namespace} />
    );
    fireEvent.click(getByText('+8'));
    expect(getByText('tag3: value3')).toBeTruthy();
    expect(getByText('tag4: value4')).toBeTruthy();
    expect(getByText('tag5: value5')).toBeTruthy();
    expect(getByText('tag6: value6')).toBeTruthy();
    expect(getByText('tag7: value7')).toBeTruthy();
  });

  it('open modal with remaining tags', () => {
    const { getByText, getByPlaceholderText } = renderWithRouter(
      <CustomTags labels={labels} namespace={namespace} />
    );
    fireEvent.click(getByText('+8'));
    fireEvent.click(getByText('+3'));
    const modalHeading = document.querySelector('h2');
    expect(modalHeading.textContent).to.equal('All Tags');
    expect(getByPlaceholderText('Search for a tag')).toBeTruthy();
  });

  it('filter tags in modal', () => {
    const { getByText, getByPlaceholderText } = renderWithRouter(
      <CustomTags labels={labels} namespace={namespace} />
    );
    fireEvent.click(getByText('+8'));
    fireEvent.click(getByText('+3'));
    fireEvent.change(getByPlaceholderText('Search for a tag'), {
      target: { value: 'tag3' }
    });

    const modal = document.querySelector('.cds--modal-content');
    const filteredTags = within(modal).getAllByTitle('tag3: value3');
    expect(filteredTags.length).toBe(1);
    expect(filteredTags[0]).toBeTruthy();
    expect(within(modal).queryByText('tag10: value10')).not.toBeTruthy();
  });
});
