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
import {
  renderWithIntl,
  renderWithRouter
} from '@tektoncd/dashboard-components/src/utils/test';

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

    const { getByText } = renderWithIntl(
      <TriggerContainer
        error={errorMessage}
        fetchTrigger={() => Promise.resolve()}
        intl={intl}
        match={match}
      />
    );
    await waitFor(() => getByText('Error loading resource'));
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('handles updates', async () => {
    const fetchTriggerSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    const match = {
      params: {
        triggerName: 'bar',
        namespace: 'default'
      }
    };

    const { getByText, rerender } = renderWithIntl(
      <TriggerContainer
        fetchTrigger={fetchTriggerSpy}
        intl={intl}
        match={match}
      />
    );
    await waitFor(() => getByText('Error loading resource'));
    expect(fetchTriggerSpy).toHaveBeenCalledTimes(1);

    renderWithIntl(
      <TriggerContainer
        fetchTrigger={fetchTriggerSpy}
        intl={intl}
        match={match}
      />,
      { rerender }
    );
    // nothing has changed so fetchData shouldn't be called
    expect(fetchTriggerSpy).toHaveBeenCalledTimes(1);

    const matchWithUpdatedNamespace = {
      params: {
        ...match.params,
        namespace: 'updated_namespace'
      }
    };
    renderWithIntl(
      <TriggerContainer
        fetchTrigger={fetchTriggerSpy}
        intl={intl}
        match={matchWithUpdatedNamespace}
      />,
      { rerender }
    );
    expect(fetchTriggerSpy).toHaveBeenCalledTimes(2);

    const matchWithUpdatedtriggerName = {
      params: {
        ...matchWithUpdatedNamespace.params,
        triggerName: 'updated_triggerName'
      }
    };
    renderWithIntl(
      <TriggerContainer
        fetchTrigger={fetchTriggerSpy}
        intl={intl}
        match={matchWithUpdatedtriggerName}
        webSocketConnected={false}
      />,
      { rerender }
    );
    expect(fetchTriggerSpy).toHaveBeenCalledTimes(3);

    renderWithIntl(
      <TriggerContainer
        fetchTrigger={fetchTriggerSpy}
        intl={intl}
        match={matchWithUpdatedtriggerName}
        webSocketConnected
      />,
      { rerender }
    );
    expect(fetchTriggerSpy).toHaveBeenCalledTimes(4);
  });

  it('renders the trigger resource', async () => {
    const triggerName = 'fake_triggerName';
    const templateName = 'fake_templateName';
    const fetchTriggerSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    const match = {
      params: {
        triggerName,
        namespace: 'default'
      }
    };

    const { queryByText } = renderWithRouter(
      <TriggerContainer
        fetchTrigger={fetchTriggerSpy}
        intl={intl}
        match={match}
        trigger={{
          metadata: { name: triggerName },
          spec: { template: { ref: templateName } }
        }}
      />
    );
    expect(queryByText(triggerName)).toBeTruthy();
    expect(queryByText(templateName)).toBeTruthy();
  });
});
