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
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';

import KeyValueList from './KeyValueList';

storiesOf('Components/KeyValueList', module)
  .add('default', () => {
    return (
      <KeyValueList
        legendText={text('legendText', 'Legend Text')}
        keyValues={[
          {
            id: '0',
            key: text('key', 'foo'),
            keyPlaceholder: 'foo',
            value: text('value', 'bar'),
            valuePlaceholder: 'bar'
          },
          {
            id: '1',
            key: '',
            keyPlaceholder: text('keyPlaceholder', 'key placeholder'),
            value: '',
            valuePlaceholder: text('valuePlaceholder', 'value placeholder')
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
        ]}
        invalidFields={{ '2-key': true, '3-value': true }}
        invalidText={text('invalidText', 'There are invalid KeyValue entries.')}
        onChange={action('onChange')}
        onAdd={action('onAdd')}
        onRemove={action('onRemove')}
      />
    );
  })
  .add('minKeyValues', () => {
    return (
      <KeyValueList
        legendText={text('legendText', 'Legend Text')}
        keyValues={[
          {
            id: '0',
            key: text('key', 'foo'),
            keyPlaceholder: text('keyPlaceholder', 'foo'),
            value: text('value', 'bar'),
            valuePlaceholder: text('valuePlaceholder', 'bar')
          }
        ]}
        minKeyValues={1}
        invalidFields={{}}
        onChange={action('onChange')}
        onAdd={action('onAdd')}
        onRemove={action('onRemove')}
      />
    );
  });
