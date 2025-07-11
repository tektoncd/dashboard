/*
Copyright 2025 The Tekton Authors
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
import TagsWithOverflow from './TagsWithOverflow';

const resource = {
  metadata: {
    labels: {
      tag1: 'value1',
      tag2: 'value2',
      tag3: 'value3',
      tag4: 'value4',
      tag5: 'value5',
      tag6: 'value6',
      tag7: 'value7',
      tag8: 'value8',
      tag9: 'value9',
      tag10: 'value10',
      tag11: 'value11',
      tag12: 'value12',
      tag13: 'value13',
      tag14: 'value14',
      tag15: 'value15'
    }
  },
  kind: 'PipelineRun'
};

const namespace = 'default';

describe('TagsWithOverflow with overflow', () => {
  it('renders visible tags', () => {
    const { getByText } = renderWithRouter(
      <TagsWithOverflow resource={resource} namespace={namespace} />
    );
    expect(getByText('tag1: value1')).toBeTruthy();
    expect(getByText('tag2: value2')).toBeTruthy();
    expect(getByText('tag3: value3')).toBeTruthy();
    expect(getByText('tag4: value4')).toBeTruthy();
  });

  it('renders overflow tags with popover', () => {
    const { getByText } = renderWithRouter(
      <TagsWithOverflow resource={resource} namespace={namespace} />
    );
    fireEvent.click(getByText('+11'));
    expect(getByText('tag5: value5')).toBeTruthy();
    expect(getByText('tag6: value6')).toBeTruthy();
    expect(getByText('tag7: value7')).toBeTruthy();
    expect(getByText('tag8: value8')).toBeTruthy();
    expect(getByText('tag9: value9')).toBeTruthy();
  });

  it('open modal with remaining tags', () => {
    const { getByText, getByPlaceholderText, queryByRole } = renderWithRouter(
      <TagsWithOverflow resource={resource} namespace={namespace} />
    );
    fireEvent.click(getByText('+11'));
    fireEvent.click(getByText('+6'));
    const dialog = queryByRole('dialog');
    expect(dialog).toBeTruthy();
    const modalHeading = within(dialog).queryByText('All labels');
    expect(modalHeading).toBeTruthy();
    expect(getByPlaceholderText('Search for a label')).toBeTruthy();
  });

  it('filter tags in modal', () => {
    const { getByText, getByPlaceholderText, queryByRole } = renderWithRouter(
      <TagsWithOverflow resource={resource} namespace={namespace} />
    );
    fireEvent.click(getByText('+11'));
    fireEvent.click(getByText('+6'));
    fireEvent.change(getByPlaceholderText('Search for a label'), {
      target: { value: 'tag3' }
    });

    const dialog = queryByRole('dialog');
    const filteredTags = within(dialog).getAllByTitle('tag3: value3');
    expect(filteredTags.length).toBe(1);
    expect(filteredTags[0]).toBeTruthy();
    expect(within(dialog).queryByText('tag10: value10')).not.toBeTruthy();
  });
});
