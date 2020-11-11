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
import { getStatus } from '@tektoncd/dashboard-utils';
import { action } from '@storybook/addon-actions';
import { TrashCan32 as Delete } from '@carbon/icons-react';
import { Dropdown } from 'carbon-components-react';

import { StatusIcon } from '..';
import PipelineRuns from '.';

function getFilters(showFilters) {
  return showFilters ? (
    <Dropdown
      id="status-filter"
      initialSelectedItem="All"
      items={['All', 'Succeeded', 'Failed']}
      light
      label="Status"
      titleText="Status:"
      type="inline"
    />
  ) : null;
}

export default {
  component: PipelineRuns,
  title: 'Components/PipelineRuns'
};

export const Base = () => (
  <PipelineRuns
    createPipelineRunURL={({ namespace, pipelineRunName }) =>
      namespace ? `to-pipelineRun-${namespace}/${pipelineRunName}` : null
    }
    createPipelineRunsByPipelineURL={({ namespace, pipelineName }) =>
      namespace
        ? `to-pipeline-${namespace}/${pipelineName}`
        : `to-pipeline/${pipelineName}`
    }
    createPipelineRunTimestamp={pipelineRun =>
      getStatus(pipelineRun).lastTransitionTime ||
      pipelineRun.metadata.creationTimestamp
    }
    selectedNamespace="default"
    pipelineRunActions={[
      {
        actionText: 'Cancel',
        action: resource => resource,
        disable: resource =>
          resource.status && resource.status.conditions[0].reason !== 'Running',
        modalProperties: {
          heading: 'cancel',
          primaryButtonText: 'ok',
          secondaryButtonText: 'no',
          body: resource => `cancel pipelineRun ${resource.metadata.name}`
        }
      }
    ]}
    pipelineRuns={[
      {
        metadata: {
          name: 'pipeline-run-20190816124708',
          namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
          uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e',
          creationTimestamp: '2019-08-16T12:48:00Z'
        },
        spec: {
          pipelineRef: {
            name: 'pipeline'
          }
        },
        status: {
          conditions: [
            {
              lastTransitionTime: '2019-08-16T12:49:28Z',
              message: 'All Tasks have completed executing',
              reason: 'Succeeded',
              status: 'True',
              type: 'Succeeded'
            }
          ]
        }
      },
      {
        metadata: {
          name: 'pipeline-run-20190816170431',
          namespace: '21cf1eac-7392-4e67-a4d0-f654506fe04d',
          uid: 'a7812005-f766-4877-abd4-b3d418b04f66',
          creationTimestamp: '2019-08-16T17:09:12Z'
        },
        spec: {
          pipelineRef: {
            name: 'pipeline'
          }
        },
        status: {
          conditions: [
            {
              lastTransitionTime: '2019-08-16T17:10:49Z',
              message: 'Not all Tasks have completed executing',
              reason: 'Running',
              status: 'Unknown',
              type: 'Succeeded'
            }
          ]
        }
      },
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: {
          name: 'output-pipeline-run',
          creationTimestamp: '2019-10-09T17:10:49Z'
        },
        spec: {
          pipelineRef: {
            name: 'output-pipeline'
          },
          serviceAccountName: 'default',
          resources: [
            {
              name: 'source-repo',
              resourceRef: {
                name: 'skaffold-git'
              }
            }
          ]
        }
      }
    ]}
    cancelPipelineRun={() => {}}
  />
);

export const NoPipelineLink = () => (
  <PipelineRuns
    createPipelineRunURL={({ namespace, pipelineRunName }) =>
      namespace ? `to-pipelineRun-${namespace}/${pipelineRunName}` : null
    }
    createPipelineRunsByPipelineURL={() => null}
    createPipelineRunTimestamp={pipelineRun =>
      getStatus(pipelineRun).lastTransitionTime ||
      pipelineRun.metadata.creationTimestamp
    }
    selectedNamespace="default"
    pipelineRunActions={[
      {
        actionText: 'Cancel',
        action: resource => resource,
        disable: resource =>
          resource.status && resource.status.conditions[0].reason !== 'Running',
        modalProperties: {
          heading: 'cancel',
          primaryButtonText: 'ok',
          secondaryButtonText: 'no',
          body: resource => `cancel pipelineRun ${resource.metadata.name}`
        }
      }
    ]}
    pipelineRuns={[
      {
        metadata: {
          name: 'pipeline-run-20190816124708',
          namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
          uid: '7c266264-4d4d-45e3-ace0-041be8f7d06e',
          creationTimestamp: '2019-08-16T12:48:00Z'
        },
        spec: {
          pipelineRef: {
            name: 'pipeline'
          }
        },
        status: {
          conditions: [
            {
              lastTransitionTime: '2019-08-16T12:49:28Z',
              message: 'All Tasks have completed executing',
              reason: 'Succeeded',
              status: 'True',
              type: 'Succeeded'
            }
          ]
        }
      },
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: {
          name: 'output-pipeline-run',
          creationTimestamp: '2019-10-09T17:10:49Z'
        },
        spec: {
          serviceAccountName: 'default',
          resources: [
            {
              name: 'source-repo',
              resourceRef: {
                name: 'skaffold-git'
              }
            }
          ]
        }
      }
    ]}
    cancelPipelineRun={() => {}}
  />
);

export const BatchActions = () => (
  <PipelineRuns
    batchActionButtons={[
      { onClick: action('handleDelete'), text: 'Delete', icon: Delete }
    ]}
    selectedNamespace="default"
    pipelineRunActions={[
      {
        actionText: 'An Action',
        action: resource => resource,
        modalProperties: {
          heading: 'An Action',
          primaryButtonText: 'OK',
          secondaryButtonText: 'Cancel',
          body: () => 'Do something interesting'
        }
      }
    ]}
    pipelineRuns={[
      {
        metadata: {
          name: 'pipeline-run-20190816124708',
          namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
          creationTimestamp: '2019-08-16T12:48:00Z'
        },
        spec: {
          pipelineRef: {
            name: 'pipeline'
          }
        }
      },
      {
        apiVersion: 'tekton.dev/v1alpha1',
        kind: 'PipelineRun',
        metadata: {
          name: 'output-pipeline-run',
          namespace: 'default',
          creationTimestamp: '2019-10-09T17:10:49Z'
        },
        spec: {
          serviceAccountName: 'default',
          resources: [
            {
              name: 'source-repo',
              resourceRef: {
                name: 'skaffold-git'
              }
            }
          ]
        }
      }
    ]}
  />
);

export const CustomColumns = ({ showFilters }) => (
  <PipelineRuns
    columns={[
      'status',
      'name',
      'pipeline',
      'trigger',
      'createdTime',
      'duration'
    ]}
    customColumns={{
      status: {
        getValue() {
          return (
            <div className="tkn--definition">
              <div className="tkn--status">
                <StatusIcon /> Pending
              </div>
            </div>
          );
        }
      },
      trigger: {
        header: 'Trigger',
        getValue({ pipelineRun }) {
          const trigger = pipelineRun.metadata.labels['tekton.dev/trigger'];
          return <span title={trigger}>{trigger}</span>;
        }
      }
    }}
    filters={getFilters(showFilters)}
    pipelineRunActions={[
      {
        actionText: 'An Action',
        action: resource => resource,
        modalProperties: {
          heading: 'An Action',
          primaryButtonText: 'OK',
          secondaryButtonText: 'Cancel',
          body: () => 'Do something interesting'
        }
      }
    ]}
    pipelineRuns={[
      {
        metadata: {
          name: 'pipeline-run-20190816124708',
          namespace: 'cb4552a6-b2d7-45e2-9773-3d4ca33909ff',
          creationTimestamp: '2019-08-16T12:48:00Z',
          labels: {
            'tekton.dev/trigger': 'my-trigger'
          }
        },
        spec: {
          pipelineRef: {
            name: 'pipeline'
          }
        }
      }
    ]}
  />
);
CustomColumns.args = {
  showFilters: false
};

export const Loading = () => (
  <PipelineRuns
    selectedNamespace="default"
    loading
    pipelineRuns={[]}
    cancelPipelineRun={() => {}}
  />
);

export const Empty = () => (
  <PipelineRuns
    selectedNamespace="default"
    pipelineRuns={[]}
    cancelPipelineRun={() => {}}
  />
);
