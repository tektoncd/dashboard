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
import { storiesOf } from '@storybook/react';
import StoryRouter from 'storybook-react-router';

import Trigger from './Trigger';

const props = {
  eventListenerNamespace: 'default',
  trigger: {
    name: 'my-trigger',
    bindings: [
      { name: 'triggerbinding0' },
      { name: 'triggerbinding1' },
      { name: 'triggerbinding2' }
    ],
    template: {
      name: 'triggertemplate'
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

storiesOf('Components/Trigger', module)
  .addDecorator(StoryRouter())
  .add('default', () => <Trigger {...props} />)
  .add('no name', () => (
    <Trigger {...props} trigger={{ ...props.trigger, name: undefined }} />
  ))
  .add('no bindings', () => (
    <Trigger {...props} trigger={{ ...props.trigger, bindings: undefined }} />
  ))
  .add('no interceptors', () => (
    <Trigger
      {...props}
      trigger={{ ...props.trigger, interceptors: undefined }}
    />
  ))
  .add('no headers in webhook interceptor', () => (
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
  ));
