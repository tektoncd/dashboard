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

import fetchMock from 'fetch-mock';
import { labels } from '@tektoncd/dashboard-utils';

import * as API from '.';
import { mockCSRFToken } from '../utils/test';

it('getCustomResource', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const name = 'testresource';
  const namespace = 'testnamespace';
  const data = { fake: 'resourcedata' };
  fetchMock.get(`end:${name}`, data);
  return API.getCustomResource({ group, version, type, namespace, name }).then(
    resource => {
      expect(resource).toEqual(data);
      fetchMock.restore();
    }
  );
});

it('getCustomResources', () => {
  const group = 'testgroup';
  const version = 'testversion';
  const type = 'testtype';
  const namespace = 'testnamespace';
  const data = { items: 'resourcedata' };
  fetchMock.get(`end:${type}/`, data);
  return API.getCustomResources({ group, version, type, namespace }).then(
    resources => {
      expect(resources).toEqual(data.items);
      fetchMock.restore();
    }
  );
});

it('getNamespaces returns the correct data', () => {
  const data = {
    items: 'namespaces'
  };
  fetchMock.get(/namespaces/, data);
  return API.getNamespaces().then(response => {
    expect(response).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getPodLog', () => {
  const namespace = 'default';
  const name = 'foo';
  const data = 'logs';
  const responseConfig = {
    body: data,
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  };
  fetchMock.get(`end:${name}/log`, responseConfig, {
    sendAsJson: false
  });
  return API.getPodLog({ name, namespace }).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('getPodLog with container name', () => {
  const namespace = 'default';
  const name = 'foo';
  const container = 'containerName';
  const data = 'logs';
  const responseConfig = {
    body: data,
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  };
  fetchMock.get(`end:${name}/log?container=${container}`, responseConfig, {
    sendAsJson: false
  });
  return API.getPodLog({ container, name, namespace }).then(log => {
    expect(log).toEqual(data);
    fetchMock.restore();
  });
});

it('importResources', () => {
  const mockDateNow = jest
    .spyOn(Date, 'now')
    .mockImplementation(() => 'fake-timestamp');
  const repositoryURL = 'https://github.com/test/testing';
  const applyDirectory = 'fake-directory';
  const namespace = 'fake-namespace';
  const serviceAccount = 'fake-serviceAccount';
  const importerNamespace = 'fake-importer-namespace';

  const payload = {
    repositoryURL,
    applyDirectory,
    namespace,
    serviceAccount,
    importerNamespace
  };
  const data = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      name: `import-resources-${Date.now()}`,
      labels: {
        app: 'tekton-app',
        [labels.DASHBOARD_IMPORT]: 'true'
      }
    },
    spec: {
      params: [
        {
          name: 'apply-directory',
          value: 'fake-directory'
        },
        {
          name: 'target-namespace',
          value: 'fake-namespace'
        }
      ],
      pipelineSpec: {
        params: [
          {
            default: '/workspace/git-source',
            description: 'The path to the resource files to apply',
            name: 'pathToResourceFiles',
            type: 'string'
          },
          {
            default: '.',
            description: 'The directory from which resources are to be applied',
            name: 'apply-directory',
            type: 'string'
          },
          {
            default: 'tekton-pipelines',
            description:
              'The namespace in which to create the resources being imported',
            name: 'target-namespace',
            type: 'string'
          }
        ],
        resources: [
          {
            name: 'git-source',
            type: 'git'
          }
        ],
        tasks: [
          {
            name: 'import-resources',
            params: [
              {
                name: 'pathToResourceFiles',
                value: '$(params.pathToResourceFiles)'
              },
              {
                name: 'apply-directory',
                value: '$(params.apply-directory)'
              },
              {
                name: 'target-namespace',
                value: '$(params.target-namespace)'
              }
            ],
            resources: {
              inputs: [
                {
                  name: 'git-source',
                  resource: 'git-source'
                }
              ]
            },
            taskSpec: {
              params: [
                {
                  default: '/workspace/git-source',
                  description: 'The path to the resource files to apply',
                  name: 'pathToResourceFiles',
                  type: 'string'
                },
                {
                  default: '.',
                  description:
                    'The directory from which resources are to be applied',
                  name: 'apply-directory',
                  type: 'string'
                },
                {
                  default: 'tekton-pipelines',
                  description:
                    'The namespace in which to create the resources being imported',
                  name: 'target-namespace',
                  type: 'string'
                }
              ],
              resources: {
                inputs: [
                  {
                    name: 'git-source',
                    type: 'git'
                  }
                ]
              },
              steps: [
                {
                  args: [
                    'apply',
                    '-f',
                    '$(params.pathToResourceFiles)/$(params.apply-directory)',
                    '-n',
                    '$(params.target-namespace)'
                  ],
                  command: ['kubectl'],
                  image: 'lachlanevenson/k8s-kubectl:latest',
                  name: 'kubectl-apply'
                }
              ]
            }
          }
        ]
      },
      resources: [
        {
          name: 'git-source',
          resourceSpec: {
            params: [
              {
                name: 'url',
                value: 'https://github.com/test/testing'
              },
              {
                name: 'revision',
                value: 'master'
              }
            ],
            type: 'git'
          }
        }
      ]
    }
  };

  mockCSRFToken();
  fetchMock.post('*', { body: data, status: 201 });
  return API.importResources(payload).then(response => {
    expect(response).toEqual(data);
    expect(JSON.parse(fetchMock.lastOptions().body)).toMatchObject(data);
    fetchMock.restore();
    mockDateNow.mockRestore();
  });
});
