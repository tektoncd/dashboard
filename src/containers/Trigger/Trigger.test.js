/*
Copyright 2021 The Tekton Authors
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

import * as API from '../../api/triggers';
import { render, renderWithRouter } from '../../utils/test';
import { TriggerContainer } from './Trigger';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

describe('TriggerContainer', () => {
  it('handles error state', async () => {
    const match = {
      params: {
        triggerName: 'bar'
      }
    };

    const errorMessage = 'fake_errorMessage';
    jest
      .spyOn(API, 'useTrigger')
      .mockImplementation(() => ({ error: errorMessage }));

    const { getByText } = render(
      <TriggerContainer intl={intl} match={match} />
    );
    await waitFor(() => getByText('Error loading resource'));
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders the trigger resource', async () => {
    const triggerName = 'fake_triggerName';
    const templateName = 'fake_templateName';
    const match = {
      params: {
        triggerName,
        namespace: 'default'
      }
    };

    jest.spyOn(API, 'useTrigger').mockImplementation(() => ({
      data: {
        metadata: { name: triggerName },
        spec: { template: { ref: templateName } }
      }
    }));

    const { queryByText } = renderWithRouter(
      <TriggerContainer intl={intl} match={match} />
    );
    expect(queryByText(triggerName)).toBeTruthy();
    expect(queryByText(templateName)).toBeTruthy();
  });
});
