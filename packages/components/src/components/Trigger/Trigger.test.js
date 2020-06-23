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
import Trigger from './Trigger';
import { renderWithRouter } from '../../utils/test';

const fakeTrigger = {
  name: 'my-fake-trigger',
  bindings: [
    {
      apiversion: 'v1alpha1',
      ref: 'triggerbinding-0'
    },
    {
      apiversion: 'v1alpha1',
      ref: 'triggerbinding-1'
    },
    {
      apiversion: 'v1alpha1',
      kind: 'ClusterTriggerBinding',
      ref: 'triggerbinding-2'
    }
  ],
  template: {
    apiversion: 'v1alpha1',
    name: 'simple-pipeline-template'
  },
  interceptors: [
    {
      webhook: {
        header: [
          {
            name: 'Wext-Repository-Url',
            value: 'https://github.com/myorg/myrepo'
          },
          {
            name: 'Wext-Incoming-Event',
            value: 'wext-incoming-event-value'
          },
          {
            name: 'Wext-Secret-Name',
            value: 'wext-secret-name-value'
          },
          {
            name: 'Array-Header-Name',
            value: [
              'array-header-value-0',
              'array-header-value-1',
              'array-header-value-2'
            ]
          }
        ],
        objectRef: {
          apiVersion: 'v1',
          kind: 'Service',
          name: 'webhook-service-name',
          namespace: 'webhook-service-namespace'
        }
      }
    },
    {
      github: {
        secretRef: {
          secretName: 'my-github-secret',
          secretKey: 'github-secret-key',
          namespace: 'github-secret-namespace'
        },
        eventTypes: ['github-event-0', 'github-event-1', 'github-event-2']
      }
    },
    {
      gitlab: {
        secretRef: {
          secretName: 'my-gitlab-secret',
          secretKey: 'gitlab-secret-key',
          namespace: 'gitlab-secret-namespace'
        },
        eventTypes: ['gitlab-event-0', 'gitlab-event-1', 'gitlab-event-2']
      }
    },
    {
      cel: {
        filter: 'cel-filter',
        overlays: [
          {
            expression: 'expression',
            key: 'key'
          }
        ]
      }
    }
  ]
};

describe('Trigger', () => {
  it('renders all details', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: fakeTrigger
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Name/i)).toBeTruthy();
    expect(queryByText(/my-fake-trigger/i)).toBeTruthy();
    expect(queryByText(/TriggerBinding/i)).toBeTruthy();
    expect(queryByText(/triggerbinding-0/i)).toBeTruthy();
    expect(queryByText(/triggerbinding-1/i)).toBeTruthy();
    expect(queryByText(/triggerbinding-2/i)).toBeTruthy();
    expect(queryByText(/TriggerTemplate/i)).toBeTruthy();
    expect(queryByText(/simple-pipeline-template/i)).toBeTruthy();
    expect(queryByText(/Interceptors/i)).toBeTruthy();
    // Check Webhook Interceptor
    expect(queryByText(/(webhook)/i)).toBeTruthy();
    expect(queryByText(/webhook-service-name/i)).toBeTruthy();
    expect(queryByText(/webhook-service-namespace/i)).toBeTruthy();
    expect(queryByText(/Header/i)).toBeTruthy();
    fakeTrigger.interceptors[0].webhook.header.forEach(({ name, value }) => {
      expect(queryByText(new RegExp(name, 'i'))).toBeTruthy();
      if (Array.isArray(value)) {
        value.forEach(element => {
          expect(queryByText(new RegExp(element, 'i'))).toBeTruthy();
        });
      } else {
        expect(queryByText(new RegExp(value, 'i'))).toBeTruthy();
      }
    });
    // Check GitHub Interceptor
    expect(queryByText(/(github)/i)).toBeTruthy();
    expect(queryByText(/my-github-secret/i)).toBeTruthy();
    expect(queryByText(/github-secret-key/i)).toBeTruthy();
    expect(queryByText(/github-secret-namespace/i)).toBeTruthy();
    expect(queryByText(/github-event-0/i)).toBeTruthy();
    expect(queryByText(/github-event-1/i)).toBeTruthy();
    expect(queryByText(/github-event-2/i)).toBeTruthy();
    // Check GitLab Interceptor
    expect(queryByText(/(gitlab)/i)).toBeTruthy();
    expect(queryByText(/my-gitlab-secret/i)).toBeTruthy();
    expect(queryByText(/gitlab-secret-key/i)).toBeTruthy();
    expect(queryByText(/gitlab-secret-namespace/i)).toBeTruthy();
    expect(queryByText(/gitlab-event-0/i)).toBeTruthy();
    expect(queryByText(/gitlab-event-1/i)).toBeTruthy();
    expect(queryByText(/gitlab-event-2/i)).toBeTruthy();
    // Check CEL Interceptor
    expect(queryByText(/(cel)/i)).toBeTruthy();
    expect(queryByText(/cel-filter/i)).toBeTruthy();
    expect(queryByText(/key/i)).toBeTruthy();
    expect(queryByText(/expression/i)).toBeTruthy();
  });

  it('handles no objectRef in webhook Interceptor', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        interceptors: [
          {
            webhook: {}
          }
        ]
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/1./i)).toBeFalsy();
  });

  it('handles empty Interceptor', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        interceptors: [{}]
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Interceptors/i)).toBeTruthy();
  });

  it('handles no Interceptors', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        interceptors: []
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Interceptors/i)).toBeFalsy();
  });

  it('handles missing Interceptors', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        interceptors: undefined
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Interceptors/i)).toBeFalsy();
  });

  it('handles webhook Interceptor without Header', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        interceptors: [
          {
            webhook: {
              objectRef: {
                apiVersion: 'v1',
                kind: 'Service',
                name: 'webhook-service-name',
                namespace: 'webhook-service-namespace'
              }
            }
          }
        ]
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Header/i)).toBeFalsy();
  });

  it('handles no name', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        name: undefined
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Trigger/i)).toBeTruthy();
  });

  it('handles no bindings', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        bindings: undefined
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/TriggerBindings/i)).toBeFalsy();
  });
});
