/*
Copyright 2019-2024 The Tekton Authors
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
/* eslint-disable formatjs/no-literal-string-in-jsx */

import { getStatus } from '@tektoncd/dashboard-utils';
import { action } from '@storybook/addon-actions';
import { TrashCan32 as Delete } from '@carbon/icons-react';
import { Dropdown } from 'carbon-components-react';

import StatusIcon from '../StatusIcon';
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
  title: 'PipelineRuns'
};

export const Default = () => (
  <PipelineRuns
    getPipelineRunURL={({ namespace, pipelineRunName }) =>
      namespace ? `to-pipelineRun-${namespace}/${pipelineRunName}` : null
    }
    getPipelineRunsByPipelineURL={({ namespace, pipelineName }) =>
      namespace
        ? `to-pipeline-${namespace}/${pipelineName}`
        : `to-pipeline/${pipelineName}`
    }
    createPipelineRunTimestamp={pipelineRun =>
      getStatus(pipelineRun).lastTransitionTime ||
      pipelineRun.metadata.creationTimestamp
    }
    selectedNamespace="default"
    getRunActions={() => [
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
          creationTimestamp: '2019-08-16T17:09:12Z',
          labels: {
            'triggers.tekton.dev/eventlistener': 'tekton-nightly',
            'triggers.tekton.dev/trigger': 'dashboard-nightly-release'
          }
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
          creationTimestamp: '2019-10-09T17:10:49Z',
          uid: '01cb5ea7-0158-4031-bc70-6bf017533a94'
        },
        spec: {
          pipelineRef: {
            name: 'output-pipeline'
          },
          serviceAccountName: 'default'
        }
      }
    ]}
    cancelPipelineRun={() => {}}
  />
);

export const NoPipelineLink = () => (
  <PipelineRuns
    getPipelineRunURL={({ namespace, pipelineRunName }) =>
      namespace ? `to-pipelineRun-${namespace}/${pipelineRunName}` : null
    }
    getPipelineRunsByPipelineURL={() => null}
    createPipelineRunTimestamp={pipelineRun =>
      getStatus(pipelineRun).lastTransitionTime ||
      pipelineRun.metadata.creationTimestamp
    }
    selectedNamespace="default"
    getRunActions={() => [
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
          namespace: '61fe5520-a56e-4c1d-b7c3-d933b0f3c6a8',
          creationTimestamp: '2019-10-09T17:10:49Z',
          uid: '905c1ab0-203d-49ce-ad8d-4553e5d06bf0'
        },
        spec: {
          serviceAccountName: 'default'
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
    getRunActions={() => [
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
          uid: '93531810-1b80-4246-a2bd-ee146c448d13'
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
          creationTimestamp: '2019-10-09T17:10:49Z',
          uid: '77e0f4a3-40e5-46f1-84cc-ab7aa93c382c'
        },
        spec: {
          serviceAccountName: 'default'
        }
      }
    ]}
  />
);

export const HideColumns = {
  render: ({ showFilters }) => (
    <PipelineRuns
      columns={['run', 'status', 'time']}
      filters={getFilters(showFilters)}
      getRunActions={() => [
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
            uid: 'c5ef252a-4635-46b5-ad7b-32c9e04cb6d2'
          },
          spec: {
            pipelineRef: {
              name: 'pipeline'
            }
          }
        }
      ]}
    />
  ),
  args: {
    showFilters: false
  }
};

export const CustomColumns = {
  render: ({ showFilters }) => (
    <PipelineRuns
      columns={['status', 'run', 'worker', 'time']}
      customColumns={{
        status: {
          getValue() {
            return (
              <div>
                <div className="tkn--definition">
                  <div className="tkn--status">
                    <StatusIcon /> Pending
                  </div>
                </div>
                <span>&nbsp;</span>
              </div>
            );
          }
        },
        worker: {
          header: 'Worker',
          getValue({ pipelineRun }) {
            const worker = pipelineRun.metadata.labels['example.com/worker'];
            return (
              <div>
                <span title={worker}>{worker}</span>
                <span>&nbsp;</span>
              </div>
            );
          }
        }
      }}
      filters={getFilters(showFilters)}
      getRunActions={() => [
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
              'example.com/worker': 'my-worker'
            },
            uid: 'b0461c38-90e1-4d83-b32d-293cf3d0ea72'
          },
          spec: {
            pipelineRef: {
              name: 'pipeline'
            }
          }
        }
      ]}
    />
  ),
  args: {
    showFilters: false
  }
};

export const Empty = {
  args: {
    cancelPipelineRun: () => {},
    pipelineRuns: [],
    selectedNamespace: 'default'
  }
};

export const Loading = {
  args: {
    ...Empty.args,
    loading: true
  }
};
