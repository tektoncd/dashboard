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
import { waitForElement } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { renderWithRouter } from '@tektoncd/dashboard-components/src/utils/test';

import { EventListenerContainer } from './EventListener';

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

/* Displaying of Trigger info is tested in the component test */

const eventListenerName = 'tekton-webhooks-eventlistener';
const fakeEventListenerWithLabels = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'EventListener',
  metadata: {
    name: eventListenerName,
    namespace: 'tekton-pipelines',
    labels: {
      foo: 'bar',
      bar: 'baz'
    }
  },
  spec: {
    serviceType: 'NodePort',
    serviceAccountName: 'my-serviceaccount',
    triggers: [
      {
        name: 'my-trigger-0',
        bindings: [
          {
            apiversion: 'v1alpha1',
            ref: 'my-triggerbinding-0'
          }
        ],
        template: {
          apiversion: 'v1alpha1',
          name: 'my-triggertemplate-0'
        },
        interceptors: [
          {
            cel: {
              filter: 'cel-filter-0',
              overlays: [
                {
                  expression: 'expression',
                  key: 'key'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'my-trigger-1',
        bindings: [
          {
            apiversion: 'v1alpha1',
            ref: 'my-triggerbinding-1'
          }
        ],
        template: {
          apiversion: 'v1alpha1',
          name: 'my-triggertemplate-1'
        },
        interceptors: [
          {
            cel: {
              filter: 'cel-filter-1',
              overlays: [
                {
                  expression: 'expression',
                  key: 'key'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'my-trigger-2',
        bindings: [
          {
            apiversion: 'v1alpha1',
            ref: 'my-triggerbinding-2'
          }
        ],
        template: {
          apiversion: 'v1alpha1',
          name: 'my-triggertemplate-2'
        },
        interceptors: [
          {
            cel: {
              filter: 'cel-filter-2',
              overlays: [
                {
                  expression: 'expression',
                  key: 'key'
                }
              ]
            }
          }
        ]
      }
    ]
  }
};

const match = {
  params: { eventListenerName }
};

it('EventListener displays with formatted labels', async () => {
  const { queryByText, getByText } = renderWithRouter(
    <EventListenerContainer
      intl={intl}
      match={match}
      error={null}
      fetchEventListener={() => Promise.resolve(fakeEventListenerWithLabels)}
      eventListener={fakeEventListenerWithLabels}
    />
  );

  await waitForElement(() => getByText(eventListenerName));
  expect(queryByText(/Namespace/i)).toBeTruthy();
  expect(queryByText(/tekton-pipelines/i)).toBeTruthy();
  expect(queryByText(/Labels/i)).toBeTruthy();
  expect(queryByText(/foo: bar/i)).toBeTruthy();
  expect(queryByText(/bar: baz/i)).toBeTruthy();
  expect(queryByText('ServiceAccount:')).toBeTruthy();
  expect(queryByText(/my-serviceaccount/i)).toBeTruthy();
  expect(queryByText(/Service Type/i)).toBeTruthy();
  expect(queryByText(/NodePort/i)).toBeTruthy();
  // Check Trigger 0
  expect(queryByText(/my-trigger-0/i)).toBeTruthy();
  expect(queryByText(/my-triggerbinding-0/i)).toBeTruthy();
  expect(queryByText(/my-triggertemplate-0/i)).toBeTruthy();
  // Check Trigger 1
  expect(queryByText(/my-trigger-1/i)).toBeTruthy();
  expect(queryByText(/my-triggerbinding-1/i)).toBeTruthy();
  expect(queryByText(/my-triggertemplate-1/i)).toBeTruthy();
  // Check Trigger 2
  expect(queryByText(/my-trigger-2/i)).toBeTruthy();
  expect(queryByText(/my-triggerbinding-2/i)).toBeTruthy();
  expect(queryByText(/my-triggertemplate-2/i)).toBeTruthy();
});

it('EventListener handles no serviceAccountName', async () => {
  const eventListener = {
    ...fakeEventListenerWithLabels,
    spec: {
      ...fakeEventListenerWithLabels.spec,
      serviceAccountName: undefined
    }
  };
  const { queryByText, getByText } = renderWithRouter(
    <EventListenerContainer
      intl={intl}
      match={match}
      error={null}
      fetchEventListener={() => Promise.resolve(eventListener)}
      eventListener={eventListener}
    />
  );

  await waitForElement(() => getByText(eventListenerName));
  expect(queryByText('ServiceAccount:')).toBeFalsy();
});

it('EventListener handles no service type', async () => {
  const eventListener = {
    ...fakeEventListenerWithLabels,
    spec: {
      ...fakeEventListenerWithLabels.spec,
      serviceType: undefined
    }
  };
  const { queryByText, getByText } = renderWithRouter(
    <EventListenerContainer
      intl={intl}
      match={match}
      error={null}
      fetchEventListener={() => Promise.resolve(eventListener)}
      eventListener={eventListener}
    />
  );

  await waitForElement(() => getByText(eventListenerName));
  expect(queryByText(/Service Type/i)).toBeFalsy();
});

it('EventListener handles no triggers', async () => {
  const eventListener = {
    ...fakeEventListenerWithLabels,
    spec: {
      ...fakeEventListenerWithLabels.spec,
      triggers: []
    }
  };
  const { queryByText, getByText } = renderWithRouter(
    <EventListenerContainer
      intl={intl}
      match={match}
      error={null}
      fetchEventListener={() => Promise.resolve(eventListener)}
      eventListener={eventListener}
    />
  );

  await waitForElement(() => getByText(eventListenerName));
  expect(queryByText(/Trigger/i)).toBeFalsy();
});
