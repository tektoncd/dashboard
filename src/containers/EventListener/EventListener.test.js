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
import { waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { createIntl } from 'react-intl';
import { EventListenerContainer } from './EventListener';
import { renderWithRouter } from '../../utils/test';

beforeEach(jest.resetAllMocks);

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

/* Displaying of Trigger info is tested in the component test */

const fakeEventListenerWithLabels = {
  apiVersion: 'tekton.dev/v1alpha1',
  kind: 'EventListener',
  metadata: {
    name: 'tekton-webhooks-eventlistener',
    namespace: 'tekton-pipelines',
    labels: {
      foo: 'bar',
      bar: 'baz'
    }
  },
  spec: {
    triggers: [
      {
        binding: {
          apiversion: 'v1alpha1',
          name: 'simple-pipeline-push-binding'
        },
        template: {
          apiversion: 'v1alpha1',
          name: 'simple-pipeline-template'
        },
        interceptor: {
          header: [
            {
              name: 'Wext-Trigger-Name',
              value: 'mywebhook1-tekton-pipelines-push-event'
            },
            {
              name: 'Wext-Repository-Url',
              value: 'https://github.com/myorg/myrepo'
            },
            {
              name: 'Wext-Incoming-Event',
              value: 'push'
            },
            {
              name: 'Wext-Secret-Name',
              value: 'mytoken'
            }
          ],
          objectRef: {
            apiVersion: 'v1',
            kind: 'Service',
            name: 'tekton-webhooks-extension-validator',
            namespace: 'tekton-pipelines'
          }
        }
      }
    ]
  }
};

it('EventListener displays with formatted labels', async () => {
  const match = {
    params: {
      eventListenerName: 'event-listener-with-labels'
    }
  };

  const middleware = [thunk];
  const mockStore = configureStore(middleware);

  const testStore = mockStore({
    namespaces: {
      selected: 'tekton-pipelines'
    },
    eventListeners: {
      byId: 'event-listener-with-labels',
      byNamespace: { default: 'tekton-pipelines' },
      errorMessage: null,
      isFetching: false
    }
  });

  const { getByText } = renderWithRouter(
    <Provider store={testStore}>
      <EventListenerContainer
        intl={intl}
        match={match}
        error={null}
        fetchEventListener={() => Promise.resolve(fakeEventListenerWithLabels)}
        eventListener={fakeEventListenerWithLabels}
      />
    </Provider>
  );

  await waitForElement(() => getByText('event-listener-with-labels'));
});
