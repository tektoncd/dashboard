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

import { action } from '@storybook/addon-actions';

import KeyValueList from './KeyValueList';

export default {
  args: {
    legendText: 'Legend Text'
  },
  component: KeyValueList,
  title: 'KeyValueList'
};

export const Default = {
  args: {
    invalidFields: { '2-key': true, '3-value': true },
    invalidText: 'There are invalid KeyValue entries.',
    keyValues: [
      {
        id: '0',
        key: 'foo',
        keyPlaceholder: 'foo',
        value: 'bar',
        valuePlaceholder: 'bar'
      },
      {
        id: '1',
        key: '',
        keyPlaceholder: 'key placeholder',
        value: '',
        valuePlaceholder: 'value placeholder'
      },
      {
        id: '2',
        key: 'invalid key',
        keyPlaceholder: '',
        value: 'bar',
        valuePlaceholder: ''
      },
      {
        id: '3',
        key: 'foo',
        keyPlaceholder: '',
        value: 'invalid value',
        valuePlaceholder: ''
      }
    ],
    onAdd: action('onAdd'),
    onChange: action('onChange'),
    onRemove: action('onRemove')
  }
};

export const MinKeyValues = {
  args: {
    invalidFields: {},
    keyValues: [
      {
        id: '0',
        key: 'foo',
        keyPlaceholder: 'foo',
        value: 'bar',
        valuePlaceholder: 'bar'
      }
    ],
    minKeyValues: 1,
    onAdd: action('onAdd'),
    onChange: action('onChange'),
    onRemove: action('onRemove')
  },
  name: 'minKeyValues'
};
