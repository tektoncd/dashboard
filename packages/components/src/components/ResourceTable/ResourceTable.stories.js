/*
Copyright 2019-2020 The Tekton Authors
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

import ResourceTable from '.';

const title = 'title';
const id = 'id';
const headerValue = 'header';
const rowValue = 'row';
const rows = [
  {
    id,
    name: rowValue
  }
];
const headers = [{ key: 'name', header: headerValue }];

export default {
  component: ResourceTable,
  title: 'Components/ResourceTable'
};

export const Base = () => <ResourceTable />;

export const WithContent = () => (
  <ResourceTable title={title} headers={headers} rows={rows} />
);
