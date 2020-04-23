/*
Copyright 2020 The Tekton Authors
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
import { number, object } from '@storybook/addon-knobs';
import DataTableSkeleton from './DataTableSkeleton';

const props = () => ({
  columnCount: number('columnCount', 5),
  headers: object('headers', [
    { key: 'status', header: 'Status' },
    { key: 'name', header: 'Name' },
    { key: 'pipeline', header: 'Pipeline' },
    { key: 'namespace', header: 'Namespace' },
    { key: 'created', header: 'Created' },
    { key: 'duration', header: 'Duration' }
  ]),
  rowCount: number('rowCount', 5)
});

storiesOf('Components/DataTableSkeleton', module).add('default', () => (
  <DataTableSkeleton {...props()} />
));
