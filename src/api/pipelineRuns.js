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

import { getGenerateNamePrefixForRerun } from '@tektoncd/dashboard-utils';
import deepClone from 'lodash.clonedeep';

import { deleteRequest, get, patch, post } from './comms';
import {
  getQueryParams,
  getTektonAPI,
  getTektonPipelinesAPIVersion,
  removeSystemLabels,
  useCollection,
  useResource
} from './utils';

function getPipelineRunsAPI({ filters, isWebSocket, name, namespace }) {
  return getTektonAPI(
    'pipelineruns',
    { isWebSocket, namespace },
    getQueryParams({ filters, name })
  );
}

export function getPipelineRuns({ filters = [], namespace } = {}) {
  const uri = getPipelineRunsAPI({ filters, namespace });
  return get(uri);
}

export function getPipelineRun({ name, namespace }) {
  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return get(uri);
}

export function usePipelineRuns(params) {
  const webSocketURL = getPipelineRunsAPI({ ...params, isWebSocket: true });
  return useCollection({
    api: getPipelineRuns,
    kind: 'PipelineRun',
    params,
    webSocketURL
  });
}

export function usePipelineRun(params, queryConfig) {
  const webSocketURL = getPipelineRunsAPI({ ...params, isWebSocket: true });
  return useResource({
    api: getPipelineRun,
    kind: 'PipelineRun',
    params,
    queryConfig,
    webSocketURL
  });
}

export function cancelPipelineRun({ name, namespace, status = 'Cancelled' }) {
  const payload = [{ op: 'replace', path: '/spec/status', value: status }];

  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return patch(uri, payload);
}

export function deletePipelineRun({ name, namespace }) {
  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return deleteRequest(uri);
}

export function createPipelineRunRaw({ namespace, payload }) {
  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function getPipelineRunPayload({
  params: inputParams,
  labels,
  namespace,
  nodeSelector,
  pipelineName,
  pipelinePendingStatus,
  pipelineRunName = `${
    pipelineName ? `${pipelineName}-run` : 'run'
  }-${Date.now()}`,
  serviceAccount,
  timeoutsFinally,
  timeoutsPipeline,
  timeoutsTasks
}) {
  const pipelinesAPIVersion = getTektonPipelinesAPIVersion();

  const payload = {
    apiVersion: `tekton.dev/${pipelinesAPIVersion}`,
    kind: 'PipelineRun',
    metadata: {
      name: pipelineRunName,
      namespace
    },
    spec: {
      pipelineRef: {
        name: pipelineName
      },
      status: pipelinePendingStatus
    }
  };

  if (labels) {
    payload.metadata.labels = labels;
  }

  const params = Object.keys(inputParams).map(name => ({
    name,
    value: inputParams[name]
  }));
  if (params.length) {
    payload.spec.params = params;
  }

  if (nodeSelector) {
    payload.spec.podTemplate = {
      nodeSelector
    };
  }
  if (serviceAccount) {
    if (pipelinesAPIVersion === 'v1') {
      payload.spec.taskRunTemplate = {
        serviceAccountName: serviceAccount
      };
    } else {
      payload.spec.serviceAccountName = serviceAccount;
    }
  }
  if (timeoutsFinally || timeoutsPipeline || timeoutsTasks) {
    payload.spec.timeouts = {
      ...(timeoutsFinally && { finally: timeoutsFinally }),
      ...(timeoutsPipeline && { pipeline: timeoutsPipeline }),
      ...(timeoutsTasks && { tasks: timeoutsTasks })
    };
  }

  return payload;
}

export function createPipelineRun({
  labels,
  namespace,
  nodeSelector,
  params,
  pipelineName,
  pipelinePendingStatus,
  pipelineRunName,
  serviceAccount,
  timeoutsFinally,
  timeoutsPipeline,
  timeoutsTasks
}) {
  const payload = getPipelineRunPayload({
    labels,
    namespace,
    nodeSelector,
    params,
    pipelineName,
    pipelinePendingStatus,
    pipelineRunName,
    serviceAccount,
    timeoutsFinally,
    timeoutsPipeline,
    timeoutsTasks
  });
  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function generateNewPipelineRunPayload({ pipelineRun, rerun }) {
  const { annotations, labels, name, namespace, generateName } =
    pipelineRun.metadata;

  const payload = deepClone(pipelineRun);
  payload.apiVersion =
    payload.apiVersion || `tekton.dev/${getTektonPipelinesAPIVersion()}`;
  payload.kind = payload.kind || 'PipelineRun';

  function getGenerateName() {
    if (rerun) {
      return getGenerateNamePrefixForRerun(name);
    }

    return generateName || `${name}-`;
  }

  payload.metadata = {
    annotations: annotations || {},
    generateName: getGenerateName(),
    labels: labels || {},
    namespace
  };
  if (rerun) {
    payload.metadata.labels['dashboard.tekton.dev/rerunOf'] = name;
  }

  removeSystemLabels(payload);

  /*
  This is used by Tekton Pipelines as part of the conversion between v1beta1
  and v1 resources. Creating a run with this in place prevents it from actually
  executing and instead adopts the status of the original TaskRuns.

  Ideally we would just delete all `tekton.dev/*` annotations as we do with labels but
  `tekton.dev/v1beta1Resources` is required for pipelines that use PipelineResources,
  and there may be other similar annotations that are still required.

  When v1beta1 has been fully removed from Tekton Pipelines we can revisit this
  and remove all remaining `tekton.dev/*` annotations.
  */
  delete payload.metadata.annotations['tekton.dev/v1beta1TaskRuns'];
  delete payload.metadata.annotations[
    'kubectl.kubernetes.io/last-applied-configuration'
  ];
  Object.keys(payload.metadata).forEach(
    i => payload.metadata[i] === undefined && delete payload.metadata[i]
  );

  delete payload.status;

  delete payload.spec?.status;
  return { namespace, payload };
}

export function rerunPipelineRun(pipelineRun) {
  const { namespace, payload } = generateNewPipelineRunPayload({
    pipelineRun,
    rerun: true
  });

  const uri = getTektonAPI('pipelineruns', { namespace });
  return post(uri, payload).then(({ body }) => body);
}

export function startPipelineRun(pipelineRun) {
  const { name, namespace } = pipelineRun.metadata;

  const payload = [{ op: 'remove', path: '/spec/status' }];

  const uri = getTektonAPI('pipelineruns', { name, namespace });
  return patch(uri, payload);
}
