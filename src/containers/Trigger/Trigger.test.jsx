/*
Copyright 2021-2024 The Tekton Authors
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

import { waitFor } from '@testing-library/react';
import { createIntl } from 'react-intl';

import * as API from '../../api/triggers';
import { renderWithRouter } from '../../utils/test';
import { TriggerContainer } from './Trigger';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

describe('TriggerContainer', () => {
  it('handles error state', async () => {
    const errorMessage = 'fake_errorMessage';
    vi.spyOn(API, 'useTrigger').mockImplementation(() => ({
      error: errorMessage
    }));

    const { getByText } = renderWithRouter(<TriggerContainer intl={intl} />);
    await waitFor(() => getByText('Error loading resource'));
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders the trigger resource', async () => {
    const triggerName = 'fake_triggerName';
    const templateName = 'fake_templateName';
    const namespace = 'fake_namespace';

    vi.spyOn(API, 'useTrigger').mockImplementation(() => ({
      data: {
        metadata: { name: triggerName, namespace },
        spec: { template: { ref: templateName } }
      }
    }));

    const path = '/namespaces/:namespace/triggers/:triggerName';
    const { queryByText } = renderWithRouter(<TriggerContainer intl={intl} />, {
      path,
      route: `/namespaces/${namespace}/triggers/${triggerName}`
    });
    expect(queryByText(triggerName)).toBeTruthy();
    expect(queryByText(templateName)).toBeTruthy();
  });
});
