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
import { render } from '../../utils/test';

import * as api from '../../api';
import About from '.';

const dashboardSelector = { selector: '#tkn--about--dashboard-table *' };
const pipelinesSelector = { selector: '#tkn--about--pipelines-table *' };
const triggersSelector = { selector: '#tkn--about--triggers-table *' };

describe('About', () => {
  it('should render correctly', () => {
    jest.spyOn(api, 'useProperties').mockImplementation(() => ({
      data: {
        dashboardNamespace: 'tekton-dashboard',
        dashboardVersion: 'v0.100.0',
        isReadOnly: true,
        pipelinesNamespace: 'tekton-pipelines',
        pipelinesVersion: 'v0.10.0',
        triggersNamespace: 'tekton-triggers',
        triggersVersion: 'v0.3.1'
      }
    }));

    const { queryByText, queryAllByText } = render(<About />);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeTruthy();
    expect(queryByText('v0.100.0', dashboardSelector)).toBeTruthy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeTruthy();
    expect(queryAllByText('True', dashboardSelector).length).toBe(1);

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

  it('should render error when an expected property is missing', () => {
    jest.spyOn(api, 'useProperties').mockImplementation(() => ({
      data: {
        dashboardNamespace: 'tekton-dashboard',
        // DashboardVersion: '', this is intentionally missing
        isReadOnly: false,
        pipelinesNamespace: 'tekton-pipelines',
        pipelinesVersion: 'v0.10.0'
      }
    }));

    const { queryByText } = render(<About />);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeFalsy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeFalsy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeTruthy();
    expect(queryByText('tekton-pipelines', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Version', pipelinesSelector)).toBeTruthy();
    expect(queryByText('v0.10.0', pipelinesSelector)).toBeTruthy();

    expect(queryByText('Error getting data')).toBeTruthy();
    expect(queryByText('Could not find: dashboardVersion')).toBeTruthy();
  });

  it('should render error when multiple expected properties are missing', () => {
    jest.spyOn(api, 'useProperties').mockImplementation(() => ({
      data: {
        dashboardNamespace: 'tekton-dashboard'
      }
    }));

    const { queryByText } = render(<About />);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeFalsy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeFalsy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeFalsy();
    expect(queryByText('Version', pipelinesSelector)).toBeFalsy();

    expect(
      queryByText(
        'Could not find: dashboardVersion, pipelinesNamespace, pipelinesVersion'
      )
    ).toBeTruthy();
  });

  it('should not display TiggersVersion when value is not returned in the API', () => {
    jest.spyOn(api, 'useProperties').mockImplementation(() => ({
      data: {
        dashboardNamespace: 'tekton-dashboard',
        dashboardVersion: 'v0.100.0',
        pipelinesNamespace: 'tekton-pipelines',
        pipelinesVersion: 'v0.10.0'
      }
    }));

    const { queryByText } = render(<About />);

    expect(queryByText('Property', dashboardSelector)).toBeTruthy();
    expect(queryByText('Value', dashboardSelector)).toBeTruthy();
    expect(queryByText('Namespace', dashboardSelector)).toBeTruthy();
    expect(queryByText('tekton-dashboard', dashboardSelector)).toBeTruthy();
    expect(queryByText('Version', dashboardSelector)).toBeTruthy();
    expect(queryByText('ReadOnly', dashboardSelector)).toBeFalsy();

    expect(queryByText('Property', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Value', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Namespace', pipelinesSelector)).toBeTruthy();
    expect(queryByText('tekton-pipelines', pipelinesSelector)).toBeTruthy();
    expect(queryByText('Version', pipelinesSelector)).toBeTruthy();
    expect(queryByText('v0.10.0', pipelinesSelector)).toBeTruthy();
  });
});
