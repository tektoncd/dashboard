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
import { renderWithRouter } from '../../utils/test';

import Breadcrumbs from './Breadcrumbs';

it('Breadcrumbs renders with default content', () => {
  const { queryByText } = renderWithRouter(
    <Breadcrumbs match={{ url: '/pipelines/demo-pipeline' }} />
  );
  expect(queryByText(/demo-pipeline/i)).toBeTruthy();
});

it('Breadcrumbs removes unnecessary segments', () => {
  const { queryByText } = renderWithRouter(
    <Breadcrumbs
      match={{
        url:
          '/namespaces/default/pipelines/demo-pipeline/runs/demo-pipeline-run-1'
      }}
    />
  );
  expect(queryByText(/namespaces/i)).toBeFalsy();
  expect(queryByText(/default/i)).toBeFalsy();
  expect(queryByText(/runs/i)).toBeFalsy();
});
