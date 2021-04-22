/*
Copyright 2019-2021 The Tekton Authors
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

const props = {
  namespace: 'default',
  trigger: {
    name: 'my-trigger',
    bindings: [
      { ref: 'triggerbinding0' },
      { ref: 'triggerbinding1' },
      { ref: 'triggerbinding2' },
      { name: 'triggerbinding3', value: '$(body.head_commit_id)' }
    ],
    template: {
      ref: 'triggertemplate'
    },
    interceptors: [
      {
        webhook: {
          header: [
            {
              name: 'header0',
              value: 'value0'
            },
            {
              name: 'header1',
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
      },
      {
        github: {
          secretRef: {
            secretName: 'github-secret',
            secretKey: 'secret'
          },
          eventTypes: ['push', 'pull_request']
        }
      },
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
  }
};

export default {
  component: Trigger,
  parameters: {
    backgrounds: {
      default: 'white'
    }
  },
  title: 'Components/Trigger'
};

export const Base = () => <Trigger {...props} />;

export const NoName = () => (
  <Trigger {...props} trigger={{ ...props.trigger, name: undefined }} />
);

export const NoBindings = () => (
  <Trigger {...props} trigger={{ ...props.trigger, bindings: undefined }} />
);

export const NoInterceptors = () => (
  <Trigger {...props} trigger={{ ...props.trigger, interceptors: undefined }} />
);

export const NoHeadersInWebhookInterceptor = () => (
  <Trigger
    {...props}
    trigger={{
      ...props.trigger,
      interceptors: [
        {
          ...props.trigger.interceptors[0],
          webhook: {
            ...props.trigger.interceptors[0].webhook,
            header: undefined
          }
        }
      ]
    }}
  />
);
