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

const dashboardSelector = { selector: '[data-testid="dashboard-table"] *' };
const pipelinesSelector = { selector: '[data-testid="pipelines-table"] *' };
const triggersSelector = { selector: '[data-testid="triggers-table"] *' };

describe('About', () => {
  it('should render correctly', async () => {
    jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
      DashboardNamespace: 'tekton-dashboard',
      DashboardVersion: 'v0.100.0',
      PipelineNamespace: 'tekton-pipelines',
      PipelineVersion: 'v0.10.0',
      TriggersNamespace: 'tekton-triggers',
      TriggersVersion: 'v0.3.1',
      IsOpenShift: true,
      ReadOnly: true
    }));

    const { queryByText, getByTestId } = renderWithIntl(<About />);

    await waitForElement(() => getByTestId('dashboard-table'));
    await waitForElement(() => getByTestId('pipelines-table'));
    await waitForElement(() => getByTestId('triggers-table'));

    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeTruthy();
    expect(queryByText('v0.100.0', dashboardSelector)).toBeTruthy();
    expect(queryByText('IsOpenShift', dashboardSelector)).toBeTruthy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeTruthy();
    expect(queryByText('True', dashboardSelector)).toBeTruthy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeTruthy();
    expect(queryByText('tekton-pipelines', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Version', pipelinesSelector)).toBeTruthy();
    expect(queryByText('v0.10.0', pipelinesSelector)).toBeTruthy();

    expect(queryByText('Property', triggersSelector)).toBeTruthy();
    expect(queryByText('Value', triggersSelector)).toBeTruthy();
    expect(queryByText('Namespace', triggersSelector)).toBeTruthy();
    expect(queryByText('tekton-triggers', triggersSelector)).toBeTruthy();
    expect(queryByText('Version', triggersSelector)).toBeTruthy();
    expect(queryByText('v0.3.1', triggersSelector)).toBeTruthy();
  });

  it('should render error when an expected property is missing', async () => {
    const installProperties = Promise.resolve({
      DashboardNamespace: 'tekton-dashboard',
      // DashboardVersion: '', this is intentionally missing
      PipelineNamespace: 'tekton-pipelines',
      PipelineVersion: 'v0.10.0',
      IsOpenShift: false,
      ReadOnly: false
    });
    jest
      .spyOn(API, 'getInstallProperties')
      .mockImplementation(() => installProperties);

    const { queryByText, queryByTestId } = renderWithIntl(<About />);

    await waitForElement(() => queryByTestId('dashboard-table'));
    await waitForElement(() => queryByTestId('pipelines-table'));

    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeFalsy();
    expect(queryByText('IsOpenShift', dashboardSelector)).toBeFalsy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeFalsy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeTruthy();
    expect(queryByText('tekton-pipelines', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Version', pipelinesSelector)).toBeTruthy();
    expect(queryByText('v0.10.0', pipelinesSelector)).toBeTruthy();

    expect(queryByTestId('triggers-table')).toBeFalsy();

    expect(queryByText('Error getting data')).toBeTruthy();
    expect(queryByText('Could not find: DashboardVersion')).toBeTruthy();
  });

  it('should render error when multiple expected properties are missing', async () => {
    jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
      DashboardNamespace: 'tekton-dashboard'
    }));

    const { queryByText, queryByTestId } = renderWithIntl(<About />);

    await waitForElement(() => queryByTestId('dashboard-table'));
    await waitForElement(() => queryByTestId('pipelines-table'));

    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeFalsy();
    expect(queryByText('IsOpenShift', dashboardSelector)).toBeFalsy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeFalsy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeFalsy();
    expect(queryByText('Version', pipelinesSelector)).toBeFalsy();

    expect(queryByTestId('triggers-table')).toBeFalsy();

    expect(
      queryByText(
        'Could not find: DashboardVersion, PipelineNamespace, PipelineVersion'
      )
    ).toBeTruthy();
  });

  it('should not display TiggersVersion when value is not returned in the API', async () => {
    jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
      DashboardNamespace: 'tekton-dashboard',
      DashboardVersion: 'v0.100.0',
      PipelineNamespace: 'tekton-pipelines',
      PipelineVersion: 'v0.10.0'
    }));

    const { queryByText, queryByTestId } = renderWithIntl(<About />);

    await waitForElement(() => queryByTestId('dashboard-table'));
    await waitForElement(() => queryByTestId('pipelines-table'));

    expect(API.getInstallProperties).toHaveBeenCalledTimes(1);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeTruthy();
    expect(queryByText('IsOpenShift', dashboardSelector)).toBeFalsy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeFalsy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeTruthy();
    expect(queryByText('tekton-pipelines', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Version', pipelinesSelector)).toBeTruthy();
    expect(queryByText('v0.10.0', pipelinesSelector)).toBeTruthy();

    expect(queryByTestId('triggers-table')).toBeFalsy();
  });
});
