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
import { waitForElement } from 'react-testing-library';

import { renderWithIntl } from '../../utils/test';
import * as API from '../../api';
import About from '.';

describe('About', () => {
  it('should render correctly', async () => {
    jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
      InstallNamespace: 'tekton-pipelines',
      DashboardVersion: 'v0.100.0',
      PipelineVersion: 'v0.10.0',
      IsOpenShift: true
    }));

    const { queryByText } = renderWithIntl(<About />);

    await waitForElement(() => queryByText('Property'));
    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
    expect(queryByText('Value')).toBeTruthy();
    expect(queryByText('InstallNamespace')).toBeTruthy();
    expect(queryByText('tekton-pipelines')).toBeTruthy();
    expect(queryByText('DashboardVersion')).toBeTruthy();
    expect(queryByText('v0.100.0')).toBeTruthy();
    expect(queryByText('PipelineVersion')).toBeTruthy();
    expect(queryByText('v0.10.0')).toBeTruthy();
    expect(queryByText('IsOpenShift')).toBeTruthy();
    expect(queryByText('True')).toBeTruthy();
  });

  it('should render error when an expected property is missing', async () => {
    const installProperties = Promise.resolve({
      InstallNamespace: 'tekton-pipelines',
      DashboardVersion: '',
      PipelineVersion: 'v0.10.0',
      IsOpenShift: false
    });
    jest
      .spyOn(API, 'getInstallProperties')
      .mockImplementation(() => installProperties);

    const { queryByText } = renderWithIntl(<About />);

    await waitForElement(() => queryByText('Property'));
    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
    expect(queryByText('Value')).toBeTruthy();
    expect(queryByText('InstallNamespace')).toBeTruthy();
    expect(queryByText('PipelineVersion')).toBeTruthy();
    expect(queryByText('tekton-pipelines')).toBeTruthy();
    expect(queryByText('v0.10.0')).toBeTruthy();
    expect(queryByText('Error getting data')).toBeTruthy();
    expect(queryByText('Could not find: DashboardVersion')).toBeTruthy();
    expect(queryByText('IsOpenShift')).toBeFalsy();
  });

  it('should render error when multiple expected properties are missing', async () => {
    jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
      InstallNamespace: 'tekton-pipelines',
      DashboardVersion: '',
      PipelineVersion: ''
    }));

    const { queryByText } = renderWithIntl(<About />);

    await waitForElement(() => queryByText('Property'));
    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
    expect(queryByText('Property')).toBeTruthy();
    expect(queryByText('Value')).toBeTruthy();
    expect(queryByText('InstallNamespace')).toBeTruthy();
    expect(queryByText('tekton-pipelines')).toBeTruthy();
    expect(queryByText('Error getting data')).toBeTruthy();
    expect(
      queryByText(
        'Could not find: DashboardVersion, PipelineVersion, IsOpenShift'
      )
    ).toBeTruthy();
  });
});
