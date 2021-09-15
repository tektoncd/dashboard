/*
Copyright 2020-2021 The Tekton Authors
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
import { waitFor } from '@testing-library/react';
import { createIntl } from 'react-intl';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api/conditions';
import { ConditionContainer } from './Condition';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

describe('ConditionContainer', () => {
  it('handles error state', async () => {
    const error = 'fake_errorMessage';
    jest.spyOn(API, 'useCondition').mockImplementation(() => ({ error }));

    const { getByText } = renderWithRouter(<ConditionContainer intl={intl} />);
    await waitFor(() => getByText('Error loading resource'));
    expect(getByText(error)).toBeTruthy();
  });

  it('renders params', async () => {
    const condition = {
      metadata: {},
      spec: {
        params: [
          { name: 'param1', type: 'array' },
          { name: 'param2' } // type should default to string
        ]
      }
    };
    jest
      .spyOn(API, 'useCondition')
      .mockImplementation(() => ({ data: condition }));

    const { getByText } = renderWithRouter(<ConditionContainer intl={intl} />);
    expect(getByText(/parameters/i)).toBeTruthy();
    expect(getByText('param1')).toBeTruthy();
    expect(getByText('param2')).toBeTruthy();
    expect(getByText('array')).toBeTruthy();
    expect(getByText('string')).toBeTruthy();
  });

  it('renders without params', async () => {
    const condition = {
      metadata: {},
      spec: {}
    };
    jest
      .spyOn(API, 'useCondition')
      .mockImplementation(() => ({ data: condition }));

    const { queryByText } = renderWithRouter(
      <ConditionContainer intl={intl} />
    );
    expect(queryByText(/parameters/i)).toBeFalsy();
  });
});
