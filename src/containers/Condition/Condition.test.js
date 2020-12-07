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
import { waitForElement } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import { ConditionContainer } from './Condition';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

describe('ConditionContainer', () => {
  it('renders', async () => {
    const conditionName = 'bar';
    const match = {
      params: {
        conditionName
      }
    };

    const { getByText } = renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={match}
        fetchCondition={() => Promise.resolve()}
        error={null}
      />
    );
    await waitForElement(() => getByText('Error loading resource'));
  });

  it('handles error state', async () => {
    const match = {
      params: {
        conditionName: 'bar'
      }
    };

    const errorMessage = 'fake_errorMessage';

    const { getByText } = renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={match}
        error={errorMessage}
        fetchCondition={() => Promise.resolve()}
      />
    );
    await waitForElement(() => getByText('Error loading resource'));
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('handles updates', async () => {
    const fetchConditionSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    const match = {
      params: {
        conditionName: 'bar',
        namespace: 'default'
      }
    };

    const { getByText, rerender } = renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={match}
        fetchCondition={fetchConditionSpy}
      />
    );
    await waitForElement(() => getByText('Error loading resource'));
    expect(fetchConditionSpy).toHaveBeenCalledTimes(1);

    renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={match}
        fetchCondition={fetchConditionSpy}
      />,
      { rerender }
    );
    // nothing has changed so fetchData shouldn't be called
    expect(fetchConditionSpy).toHaveBeenCalledTimes(1);

    const matchWithUpdatedNamespace = {
      params: {
        ...match.params,
        namespace: 'updated_namespace'
      }
    };
    renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={matchWithUpdatedNamespace}
        fetchCondition={fetchConditionSpy}
      />,
      { rerender }
    );
    expect(fetchConditionSpy).toHaveBeenCalledTimes(2);

    const matchWithUpdatedConditionName = {
      params: {
        ...matchWithUpdatedNamespace.params,
        conditionName: 'updated_conditionName'
      }
    };
    renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={matchWithUpdatedConditionName}
        fetchCondition={fetchConditionSpy}
        webSocketConnected={false}
      />,
      { rerender }
    );
    expect(fetchConditionSpy).toHaveBeenCalledTimes(3);

    renderWithIntl(
      <ConditionContainer
        intl={intl}
        match={matchWithUpdatedConditionName}
        fetchCondition={fetchConditionSpy}
        webSocketConnected
      />,
      { rerender }
    );
    expect(fetchConditionSpy).toHaveBeenCalledTimes(4);
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
    const fetchConditionSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve(condition));
    const match = {
      params: {
        conditionName: 'bar',
        namespace: 'default'
      }
    };

    const { getByText } = renderWithIntl(
      <ConditionContainer
        condition={condition}
        intl={intl}
        match={match}
        fetchCondition={fetchConditionSpy}
      />
    );
    expect(getByText(/parameters/i)).toBeTruthy();
    expect(getByText('param1')).toBeTruthy();
    expect(getByText('param2')).toBeTruthy();
    expect(getByText('array')).toBeTruthy();
    expect(getByText('string')).toBeTruthy();
  });
});
