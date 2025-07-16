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
import LabelsWithOverflow from './LabelsWithOverflow';

const resource = {
  metadata: {
    labels: {
      label1: 'value1',
      label2: 'value2',
      label3: 'value3',
      label4: 'value4',
      label5: 'value5',
      label6: 'value6',
      label7: 'value7',
      label8: 'value8',
      label9: 'value9',
      label10: 'value10',
      label11: 'value11',
      label12: 'value12',
      label13: 'value13',
      label14: 'value14',
      label15: 'value15'
    }
  },
  kind: 'PipelineRun'
};

const namespace = 'default';

describe('LabelsWithOverflow with overflow', () => {
  it('renders visible labels', () => {
    const { getByText } = renderWithRouter(
      <LabelsWithOverflow resource={resource} namespace={namespace} />
    );
    expect(getByText('label1: value1')).toBeTruthy();
    expect(getByText('label2: value2')).toBeTruthy();
    expect(getByText('label3: value3')).toBeTruthy();
    expect(getByText('label4: value4')).toBeTruthy();
  });

  it('renders overflow labels with popover', () => {
    const { getByText } = renderWithRouter(
      <LabelsWithOverflow resource={resource} namespace={namespace} />
    );
    fireEvent.click(getByText('+11'));
    expect(getByText('label5: value5')).toBeTruthy();
    expect(getByText('label6: value6')).toBeTruthy();
    expect(getByText('label7: value7')).toBeTruthy();
    expect(getByText('label8: value8')).toBeTruthy();
    expect(getByText('label9: value9')).toBeTruthy();
  });

  it('open modal with remaining labels', () => {
    const { getByText, getByPlaceholderText, queryByRole } = renderWithRouter(
      <LabelsWithOverflow resource={resource} namespace={namespace} />
    );
    fireEvent.click(getByText('+11'));
    fireEvent.click(getByText('+6'));
    const dialog = queryByRole('dialog');
    expect(dialog).toBeTruthy();
    const modalHeading = within(dialog).queryByText('All labels');
    expect(modalHeading).toBeTruthy();
    expect(getByPlaceholderText('Search for a label')).toBeTruthy();
  });

  it('filter labels in modal', () => {
    const { getByText, getByPlaceholderText, queryByRole } = renderWithRouter(
      <LabelsWithOverflow resource={resource} namespace={namespace} />
    );
    fireEvent.click(getByText('+11'));
    fireEvent.click(getByText('+6'));
    fireEvent.change(getByPlaceholderText('Search for a label'), {
      target: { value: 'label3' }
    });

    const dialog = queryByRole('dialog');
    const filteredTags = within(dialog).getAllByTitle('label3: value3');
    expect(filteredTags.length).toBe(1);
    expect(filteredTags[0]).toBeTruthy();
    expect(within(dialog).queryByText('label10: value10')).not.toBeTruthy();
  });
});
