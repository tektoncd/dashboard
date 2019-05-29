/*
Copyright 2019 The Tekton Authors
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
import { render } from 'react-testing-library';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { App } from './App';

it('App renders successfully', () => {
  const middleware = [thunk];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    extensions: { byName: {} },
    namespaces: { byName: {} },
    pipelines: { byNamespace: {} },
    serviceAccounts: { byNamespace: {} }
  });
  const { queryByText } = render(
    <Provider store={store}>
      <App
        extensions={[]}
        fetchExtensions={() => {}}
        fetchNamespaces={() => {}}
      />
    </Provider>
  );
  expect(queryByText(/pipelines/i)).toBeTruthy();
  expect(queryByText(/tasks/i)).toBeTruthy();
});
