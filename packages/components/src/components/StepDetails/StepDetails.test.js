/*
Copyright 2019-2020 The Tekton Authors
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
import { fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../utils/test';

import StepDetails from './StepDetails';

describe('StepDetails', () => {
  it('renders', () => {
    const mockStore = configureStore();
    const store = mockStore({ namespaces: { selected: 'default' } });

    renderWithRouter(
      <Provider store={store}>
        <StepDetails stepStatus={{}} />
      </Provider>
    );
  });

  it('renders terminated state', () => {
    const mockStore = configureStore();
    const store = mockStore({ namespaces: { selected: 'default' } });

    renderWithRouter(
      <Provider store={store}>
        <StepDetails stepStatus={{ terminated: { reason: 'Completed' } }} />
      </Provider>
    );
  });

  it('renders cancelled state', () => {
    const mockStore = configureStore();
    const store = mockStore({ namespaces: { selected: 'default' } });

    renderWithRouter(
      <Provider store={store}>
        <StepDetails
          stepStatus={{}}
          taskRun={{
            status: {
              conditions: [
                {
                  type: 'Succeeded',
                  status: 'False',
                  reason: 'TaskRunCancelled'
                }
              ]
            }
          }}
        />
      </Provider>
    );
  });

  it('renders with selected view', () => {
    const mockStore = configureStore();
    const store = mockStore({ namespaces: { selected: 'default' } });

    const { getByText } = renderWithRouter(
      <Provider store={store}>
        <StepDetails stepStatus={{}} view="details" />
      </Provider>
    );

    fireEvent.click(getByText(/status/i));
  });
});
