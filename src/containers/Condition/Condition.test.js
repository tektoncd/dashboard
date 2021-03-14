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
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import { ConditionContainer } from './Condition';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

describe('ConditionContainer', () => {
  it('handles error state', async () => {
    const match = {
      params: {
        conditionName: 'bar'
      }
    };

    const errorMessage = 'fake_errorMessage';

    const { getByText } = renderWithIntl(
      <ConditionContainer
        error={errorMessage}
        fetchCondition={() => Promise.resolve()}
        intl={intl}
        match={match}
      />
    );
    await waitFor(() => getByText('Error loading resource'));
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
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={match}
      />
    );
    await waitFor(() => getByText('Error loading resource'));
    expect(fetchConditionSpy).toHaveBeenCalledTimes(1);

    renderWithIntl(
      <ConditionContainer
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={match}
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
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={matchWithUpdatedNamespace}
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
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={matchWithUpdatedConditionName}
        webSocketConnected={false}
      />,
      { rerender }
    );
    expect(fetchConditionSpy).toHaveBeenCalledTimes(3);

    renderWithIntl(
      <ConditionContainer
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={matchWithUpdatedConditionName}
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
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={match}
      />
    );
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
    const fetchConditionSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve(condition));
    const match = {
      params: {
        conditionName: 'bar',
        namespace: 'default'
      }
    };

    const { queryByText } = renderWithIntl(
      <ConditionContainer
        condition={condition}
        fetchCondition={fetchConditionSpy}
        intl={intl}
        match={match}
      />
    );
    expect(queryByText(/parameters/i)).toBeFalsy();
  });
});
