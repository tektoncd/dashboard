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
import { fireEvent } from '@testing-library/react';
import KeyValueList from './KeyValueList';
import { render } from '../../utils/test';

it('KeyValueList shows blank fields', () => {
  const props = {
    onChange() {},
    legendText: 'Legend Text',
    invalidFields: {},
    keyValues: [
      { key: 'foo0', value: '', id: 'aaaa' },
      { key: 'foo1', value: '', id: 'bbbb' },
      { key: 'foo2', value: '', id: 'cccc' }
    ],
    onAdd() {},
    onRemove() {}
  };
  const { getAllByDisplayValue, getByText } = render(
    <KeyValueList {...props} />
  );

  expect(getByText(/Legend Text/i)).toBeTruthy();
  expect(getAllByDisplayValue('').length).toEqual(3);
  expect(getAllByDisplayValue(/foo/i).length).toEqual(3);
});

it('KeyValueList incorrect fields', () => {
  const props = {
    onChange() {},
    legendText: 'Legend Text',
    invalidFields: {
      'bbbb-key': true,
      'cccc-key': true,
      'cccc-value': true
    },
    keyValues: [
      { key: 'foo0', value: 'bar0', id: 'aaaa' },
      { key: 'foo1', value: '', id: 'bbbb' },
      { key: 'foo2', value: 'bar2', id: 'cccc' },
      { key: 'foo3', value: 'bar3', id: 'dddd' }
    ],
    onAdd() {},
    onRemove() {}
  };
  const { getByDisplayValue } = render(<KeyValueList {...props} />);

  const annotationKey0 = getByDisplayValue(props.keyValues[0].key);
  const annotationKey1 = getByDisplayValue(props.keyValues[1].key);
  const annotationKey2 = getByDisplayValue(props.keyValues[2].key);
  const annotationKey3 = getByDisplayValue(props.keyValues[3].key);
  const annotationValue0 = getByDisplayValue(props.keyValues[0].value);
  const annotationValue1 = getByDisplayValue(props.keyValues[1].value);
  const annotationValue2 = getByDisplayValue(props.keyValues[2].value);
  const annotationValue3 = getByDisplayValue(props.keyValues[3].value);

  expect(annotationKey0.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationKey1.getAttribute('data-invalid')).toBeTruthy();
  expect(annotationKey2.getAttribute('data-invalid')).toBeTruthy();
  expect(annotationKey3.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationValue0.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationValue1.getAttribute('data-invalid')).toBeFalsy();
  expect(annotationValue2.getAttribute('data-invalid')).toBeTruthy();
  expect(annotationValue3.getAttribute('data-invalid')).toBeFalsy();
});

it('KeyValueList change key', () => {
  const props = {
    onChange: jest.fn(),
    invalidFields: {},
    keyValues: [{ key: 'foo0', value: 'bar0', id: 'aaaa' }],
    onAdd() {},
    onRemove() {}
  };
  const { getByDisplayValue } = render(<KeyValueList {...props} />);

  fireEvent.change(getByDisplayValue(/foo0/i), {
    target: { value: 'new key 0' }
  });

  expect(props.onChange).toHaveBeenCalledTimes(1);
  expect(props.onChange).toHaveBeenCalledWith({
    index: 0,
    type: 'key',
    value: 'new key 0'
  });
});

it('KeyValueList change value', () => {
  const props = {
    onChange: jest.fn(),
    invalidFields: {},
    keyValues: [{ key: 'foo0', value: 'bar0', id: 'aaaa' }],
    onAdd() {},
    onRemove() {}
  };
  const { getByDisplayValue } = render(<KeyValueList {...props} />);

  fireEvent.change(getByDisplayValue(/bar0/i), {
    target: { value: 'new value 0' }
  });

  expect(props.onChange).toHaveBeenCalledTimes(1);
  expect(props.onChange).toHaveBeenCalledWith({
    index: 0,
    type: 'value',
    value: 'new value 0'
  });
});

it('KeyValueList add and remove buttons work', () => {
  const props = {
    onChange() {},
    invalidFields: {},
    keyValues: [
      { key: 'foo0', value: 'bar0', id: 'aaaa' },
      { key: 'foo1', value: '', id: 'bbbb' },
      { key: 'foo2', value: 'bar2', id: 'cccc' },
      { key: 'foo3', value: 'bar3', id: 'dddd' }
    ],
    onAdd: jest.fn(),
    onRemove: jest.fn()
  };
  const { getByText, getAllByText } = render(<KeyValueList {...props} />);

  const addButton = getByText(/Add/i);

  fireEvent.click(addButton);
  fireEvent.click(addButton);
  fireEvent.click(addButton);
  fireEvent.click(addButton);
  fireEvent.click(addButton);

  fireEvent.click(getAllByText(/Remove/i)[0].parentNode);
  fireEvent.click(getAllByText(/Remove/i)[0].parentNode);
  fireEvent.click(getAllByText(/Remove/i)[0].parentNode);

  expect(props.onAdd).toHaveBeenCalledTimes(5);
  expect(props.onRemove).toHaveBeenCalledTimes(3);
});
