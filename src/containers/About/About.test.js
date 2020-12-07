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
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithIntl } from '@tektoncd/dashboard-components/src/utils/test';

import About from '.';

const dashboardSelector = { selector: '#tkn--about--dashboard-table *' };
const pipelinesSelector = { selector: '#tkn--about--pipelines-table *' };
const triggersSelector = { selector: '#tkn--about--triggers-table *' };
const middleware = [thunk];
const mockStore = configureStore(middleware);

describe('About', () => {
  it('should render correctly', async () => {
    const store = mockStore({
      properties: {
        DashboardNamespace: 'tekton-dashboard',
        DashboardVersion: 'v0.100.0',
        PipelineNamespace: 'tekton-pipelines',
        PipelineVersion: 'v0.10.0',
        TriggersNamespace: 'tekton-triggers',
        TriggersVersion: 'v0.3.1',
        IsOpenShift: true,
        ReadOnly: true
      }
    });

    const { queryByText, queryAllByText } = renderWithIntl(
      <Provider store={store}>
        <About />)
      </Provider>
    );

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeTruthy();
    expect(queryByText('v0.100.0', dashboardSelector)).toBeTruthy();
    expect(queryByText('IsOpenShift', dashboardSelector)).toBeTruthy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeTruthy();
    expect(queryAllByText('True', dashboardSelector).length).toBe(2);

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
    const store = mockStore({
      properties: {
        DashboardNamespace: 'tekton-dashboard',
        // DashboardVersion: '', this is intentionally missing
        PipelineNamespace: 'tekton-pipelines',
        PipelineVersion: 'v0.10.0',
        IsOpenShift: false,
        ReadOnly: false
      }
    });

    const { queryByText, queryByTestId } = renderWithIntl(
      <Provider store={store}>
        <About />)
      </Provider>
    );

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
    const store = mockStore({
      properties: {
        DashboardNamespace: 'tekton-dashboard'
      }
    });

    const { queryByText, queryByTestId } = renderWithIntl(
      <Provider store={store}>
        <About />)
      </Provider>
    );

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
    const store = mockStore({
      properties: {
        DashboardNamespace: 'tekton-dashboard',
        DashboardVersion: 'v0.100.0',
        PipelineNamespace: 'tekton-pipelines',
        PipelineVersion: 'v0.10.0'
      }
    });

    const { queryByText, queryByTestId } = renderWithIntl(
      <Provider store={store}>
        <About />)
      </Provider>
    );

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
