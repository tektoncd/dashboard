/*
Copyright 2019-2025 The Tekton Authors
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createIntl } from 'react-intl';
import {
  reactRouterParameters,
  withRouter
} from 'storybook-addon-remix-react-router';

import { EventListenerContainer } from './EventListener';
import { triggersAPIGroup } from '../../api/utils';

const name = 'my-eventlistener';
const namespace = 'foo';

const eventListener = {
  apiVersion: 'triggers.tekton.dev/v1alpha1',
  kind: 'EventListener',
  metadata: {
    name,
    namespace,
    creationTimestamp: '2020-01-31T16:39:21Z',
    labels: {
      foo: 'bar',
      bar: 'baz'
    }
  },
  spec: {
    serviceType: 'ClusterIP',
    serviceAccountName: 'my-serviceaccount',
    triggers: [
      {
        name: 'my-trigger',
        bindings: [
          { ref: 'triggerbinding0' },
          { ref: 'triggerbinding1' },
          { ref: 'triggerbinding2' }
        ],
        template: {
          name: 'triggertemplate'
        },
        interceptors: [
          {
            webhook: {
              header: [
                {
                  name: 'Header0',
                  value: 'value0'
                },
                {
                  name: 'Header1',
                  value: ['value1-0', 'value1-1', 'value1-2']
                }
              ],
              objectRef: {
                apiVersion: 'v1',
                kind: 'Service',
                name: 'interceptor-service0',
                namespace: 'foo'
              }
            }
          }
        ]
      },
      {
        name: 'my-trigger-1',
        bindings: [{ ref: 'triggerbinding1' }],
        template: {
          name: 'triggertemplate1'
        },
        interceptors: [
          {
            gitlab: {
              secretRef: {
                secretName: 'gitlab-secret',
                secretKey: 'secret',
                namespace: 'foo'
              },
              eventTypes: ['Push Hook']
            }
          },
          {
            cel: {
              filter: "body.matches('foo', 'bar')"
            }
          }
        ]
      },
      {
        name: 'my-trigger-2',
        bindings: [{ ref: 'triggerbinding2' }],
        template: {
          name: 'triggertemplate2'
        },
        interceptors: [
          {
            github: {
              secretRef: {
                secretName: 'github-secret',
                secretKey: 'secret'
              },
              eventTypes: ['push', 'pull_request']
            }
          }
        ]
      },
      {
        name: 'my-trigger-3',
        bindings: [{ ref: 'triggerbinding3' }],
        template: {
          name: 'triggertemplate3'
        },
        interceptors: []
      }
    ]
  }
};
const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en'
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes
      queryFn: () => {},
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity
    }
  }
});

const props = { intl };

export default {
  component: EventListenerContainer,
  decorators: [withRouter()],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { name, namespace }
      },
      routing: {
        path: '/namespaces/:namespace/eventlisteners/:name'
      }
    })
  },
  title: 'EventListener'
};

export const Default = {
  render: () => <EventListenerContainer {...props} />,

  decorators: [
    Story => {
      queryClient.setQueryData(
        [triggersAPIGroup, 'v1beta1', 'eventlisteners', { name, namespace }],
        eventListener
      );

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    }
  ]
};

export const NoTriggers = {
  render: () => <EventListenerContainer {...props} />,

  decorators: [
    Story => {
      queryClient.setQueryData(
        [triggersAPIGroup, 'v1beta1', 'eventlisteners', { name, namespace }],
        {
          ...eventListener,
          spec: { ...eventListener.spec, triggers: [] }
        }
      );

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    }
  ]
};

export const NoServiceAccount = {
  render: () => <EventListenerContainer {...props} />,

  decorators: [
    Story => {
      queryClient.setQueryData(
        [triggersAPIGroup, 'v1beta1', 'eventlisteners', { name, namespace }],
        {
          ...eventListener,
          spec: { ...eventListener.spec, serviceAccountName: undefined }
        }
      );

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    }
  ],

  name: 'No ServiceAccount'
};

export const NoServiceType = {
  render: () => <EventListenerContainer {...props} />,

  decorators: [
    Story => {
      queryClient.setQueryData(
        [triggersAPIGroup, 'v1beta1', 'eventlisteners', { name, namespace }],
        {
          ...eventListener,
          spec: { ...eventListener.spec, serviceType: undefined }
        }
      );

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    }
  ]
};
