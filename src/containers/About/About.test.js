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
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Route } from 'react-router-dom';
import { urls } from '@tektoncd/dashboard-utils';
import { renderWithRouter } from '../../utils/test';
import * as API from '../../api';
import About from '.';

const middleware = [thunk];
const mockStore = configureStore(middleware);

const initialState = {
  dashboardInfo: [],
  isLoaded: true,
  isNotFinished: true,
  error: ''
};

it('About renders errors when undefined field', async () => {
  jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
    InstallNamespace: 'tekton-pipelines',
    DashboardVersion: '',
    PipelineVersion: 'v0.10.0',
    IsOpenshift: 'True'
  }));

  const store = mockStore({
    initialState,
    notifications: {}
  });

  const { getByText, queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route path={urls.about()} render={props => <About {...props} />} />
    </Provider>,
    { route: urls.about() }
  );

  await expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
  expect(queryByText('Property')).toBeTruthy();
  expect(getByText('Value')).toBeTruthy();
  expect(getByText('InstallNamespace')).toBeTruthy();
  expect(getByText('PipelineVersion')).toBeTruthy();
  expect(getByText('IsOpenshift')).toBeTruthy();
  expect(getByText('tekton-pipelines')).toBeTruthy();
  expect(getByText('v0.10.0')).toBeTruthy();
  expect(getByText('True')).toBeTruthy();
  expect(getByText('Error getting data')).toBeTruthy();
  expect(getByText('DashboardVersion cannot be found')).toBeTruthy();
});

it('About renders correctly', async () => {
  jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
    InstallNamespace: 'tekton-pipelines',
    DashboardVersion: 'v0.100.0',
    PipelineVersion: 'v0.10.0',
    IsOpenshift: 'False'
  }));

  const store = mockStore({
    initialState,
    notifications: {}
  });

  const { getByText, queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route path={urls.about()} render={props => <About {...props} />} />
    </Provider>,
    { route: urls.about() }
  );

  await expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
  expect(queryByText('Property')).toBeTruthy();
  expect(getByText('Value')).toBeTruthy();
  expect(getByText('InstallNamespace')).toBeTruthy();
  expect(getByText('DashboardVersion')).toBeTruthy();
  expect(getByText('PipelineVersion')).toBeTruthy();
  expect(getByText('IsOpenshift')).toBeTruthy();
  expect(getByText('tekton-pipelines')).toBeTruthy();
  expect(getByText('v0.100.0')).toBeTruthy();
  expect(getByText('v0.10.0')).toBeTruthy();
  expect(getByText('False')).toBeTruthy();
});

it('About renders correctly when not loaded', async () => {
  jest.spyOn(API, 'getInstallProperties');

  const store = mockStore({
    initialState,
    notifications: {}
  });

  const { queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route path={urls.about()} render={props => <About {...props} />} />
    </Provider>,
    { route: urls.about() }
  );

  await expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
  expect(queryByText('About')).toBeTruthy();
  expect(queryByText('Property')).toBeTruthy();
  expect(queryByText('Value')).toBeTruthy();
  expect(queryByText('InstallNamespace')).toBeFalsy();
});

it('About renders errors when there are multiple undefined fields', async () => {
  jest.spyOn(API, 'getInstallProperties').mockImplementation(() => ({
    InstallNamespace: 'tekton-pipelines',
    DashboardVersion: '',
    PipelineVersion: '',
    IsOpenshift: 'True'
  }));

  const store = mockStore({
    initialState,
    notifications: {}
  });

  const { getByText, queryByText } = renderWithRouter(
    <Provider store={store}>
      <Route path={urls.about()} render={props => <About {...props} />} />
    </Provider>,
    { route: urls.about() }
  );

  await expect(API.getInstallProperties).toHaveBeenCalledTimes(1);
  expect(queryByText('Property')).toBeTruthy();
  expect(getByText('Value')).toBeTruthy();
  expect(getByText('InstallNamespace')).toBeTruthy();
  expect(getByText('tekton-pipelines')).toBeTruthy();
  expect(getByText('IsOpenshift')).toBeTruthy();
  expect(getByText('True')).toBeTruthy();
  expect(getByText('Error getting data')).toBeTruthy();
  expect(
    getByText('DashboardVersionPipelineVersion cannot be found')
  ).toBeTruthy();
});
