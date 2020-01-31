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
  binding: {
    apiversion: 'v1alpha1',
    name: 'simple-pipeline-push-binding'
  },
  interceptor: {
    header: [
      {
        name: 'Wext-Trigger-Name',
        value: 'mytrigger-tekton-pipelines-push-event'
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
  },
  name: 'mytrigger-tekton-pipelines-push-event',
  params: [
    {
      name: 'webhooks-tekton-release-name',
      value: 'myreleasename'
    },
    {
      name: 'webhooks-tekton-target-namespace',
      value: 'tekton-pipelines'
    },
    {
      name: 'webhooks-tekton-service-account',
      value: 'tekton-dashboard'
    },
    {
      name: 'webhooks-tekton-git-server',
      value: 'github.com'
    },
    {
      name: 'webhooks-tekton-git-org',
      value: 'myorg'
    },
    {
      name: 'webhooks-tekton-git-repo',
      value: 'myrepo'
    },
    {
      name: 'webhooks-tekton-docker-registry',
      value: 'myregistry'
    }
  ],
  template: {
    apiversion: 'v1alpha1',
    name: 'simple-pipeline-template'
  }
};

describe('Trigger', () => {
  it('should render all details', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: fakeTrigger
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Name/i)).toBeTruthy();
    expect(queryByText(/TriggerBinding/i)).toBeTruthy();
    expect(queryByText(/TriggerTemplate/i)).toBeTruthy();
    expect(queryByText(/Interceptor/i)).toBeTruthy();
    expect(queryByText(/Headers/i)).toBeTruthy();
    expect(queryByText(/Parameters/i)).toBeTruthy();
    expect(queryByText(/webhooks-tekton-release-name/i)).toBeTruthy();
    expect(queryByText(/webhooks-tekton-target-namespace/i)).toBeTruthy();
    expect(queryByText(/webhooks-tekton-service-account/i)).toBeTruthy();
    expect(queryByText(/webhooks-tekton-git-server/i)).toBeTruthy();
    expect(queryByText(/webhooks-tekton-git-org/i)).toBeTruthy();
    expect(queryByText(/webhooks-tekton-git-repo/i)).toBeTruthy();
    expect(queryByText(/mytrigger-tekton-pipelines-push-event/i)).toBeTruthy();
    expect(queryByText(/myreleasename/i)).toBeTruthy();
    expect(queryByText(/tekton-pipelines/i)).toBeTruthy();
    expect(queryByText(/myregistry/i)).toBeTruthy();
    expect(queryByText(/myrepo/i)).toBeTruthy();
    expect(queryByText(/myorg/i)).toBeTruthy();
    expect(queryByText(/github.com/i)).toBeTruthy();
    expect(queryByText(/simple-pipeline-template/i)).toBeTruthy();
    expect(queryByText(/Wext-Trigger-Name/i)).toBeTruthy();
    expect(queryByText(/Wext-Repository-Url/i)).toBeTruthy();
    expect(queryByText(/Wext-Incoming-Event/i)).toBeTruthy();
    expect(queryByText(/Wext-Secret-Name/i)).toBeTruthy();
  });

  it('should handle missing params and interceptor', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        params: undefined,
        interceptor: undefined
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Name/i)).toBeTruthy();
  });

  it('should handle missing interceptor headers', () => {
    const props = {
      eventListenerNamespace: 'tekton-pipelines',
      trigger: {
        ...fakeTrigger,
        interceptor: {
          ...fakeTrigger.interceptor,
          header: undefined
        }
      }
    };
    const { queryByText } = renderWithRouter(<Trigger {...props} />);
    expect(queryByText(/Interceptor/i)).toBeTruthy();
  });
});
