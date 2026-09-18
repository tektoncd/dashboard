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

import { useQuery } from '@tanstack/react-query';
import { getGenerateNamePrefixForRerun } from '@tektoncd/dashboard-utils';

import { deleteRequest, patch, post } from './comms';
import {
  findRecordByName,
  getRecord,
  listChildTaskRunRecords
} from './results';
import { useTaskRuns } from './taskRuns';
import {
  getKubeAPI,
  getTektonPipelinesAPIVersion,
  removeSystemLabels,
  tektonAPIGroup,
  useCollection,
  useResource
} from './utils';

export function usePipelineRuns(params) {
  return useCollection({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params,
    version: getTektonPipelinesAPIVersion()
  });
}

// Falls back to Tekton Results when the PipelineRun has been deleted from
// the cluster (k8s GET 404s). Keeps the same return shape as a plain
// useResource call (data/error/isPending/...) so existing consumers need no
// changes -- see PipelineRun.jsx's NotFound gate, which "just works" once
// isPending correctly stays true until the fallback has also resolved.
//
// resultUID is optional: when a link already knows which of several
// same-named Results it means (see History.jsx), it's passed as a
// ?resultUID= query param and threaded in here to fetch that exact record
// directly instead of guessing "newest" via findRecordByName.
export function usePipelineRun(
  { name, namespace, resultsAPIEnabled, resultUID },
  queryConfig
) {
  const k8sQuery = useResource({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { name, namespace },
    queryConfig,
    version: getTektonPipelinesAPIVersion()
  });

  const isNotFoundInCluster = k8sQuery.error?.response?.status === 404;

  const resultsQuery = useQuery({
    enabled:
      !!resultsAPIEnabled && isNotFoundInCluster && !!name && !!namespace,
    queryFn: () =>
      resultUID
        ? getRecord({
            recordName: `${namespace}/results/${resultUID}/records/${resultUID}`
          }).then(decoded => ({
            decoded,
            resultName: `${namespace}/results/${resultUID}`
          }))
        : findRecordByName({
            dataType: 'tekton.dev/v1.PipelineRun',
            name,
            namespace
          }),
    queryKey: ['results', 'pipelineRun', namespace, name, resultUID]
  });

  if (!isNotFoundInCluster) {
    return k8sQuery;
  }

  if (resultsQuery.data) {
    return {
      ...k8sQuery,
      data: resultsQuery.data.decoded,
      error: null,
      isFromResults: true,
      isPending: false,
      resultName: resultsQuery.data.resultName
    };
  }

  // still checking Results, or confirmed not found there either -- leave
  // data/error as the original k8s 404 result so NotFound renders once
  // resultsQuery also settles. A disabled query (resultsAPIEnabled false)
  // never settles and would report isPending: true forever, so only defer
  // to it when it's actually allowed to run.
  return {
    ...k8sQuery,
    isPending: !!resultsAPIEnabled && resultsQuery.isPending
  };
}

// Child TaskRuns of a PipelineRun sourced from Results are looked up by
// parent result UID, not by the tekton.dev/pipelineRun label (Results
// doesn't support k8s label selectors, and names get reused over time
// anyway). Falls back to the normal live label-selector query otherwise.
export function useChildTaskRuns({
  isFromResults,
  name,
  namespace,
  resultName
}) {
  const k8sQuery = useTaskRuns({
    filters: [`tekton.dev/pipelineRun=${name}`],
    namespace
  });

  const resultsQuery = useQuery({
    // isFromResults is undefined (not false) before usePipelineRun's own
    // fallback settles -- coerce explicitly, since react-query treats any
    // non-false `enabled` (including undefined) as enabled.
    enabled: !!isFromResults && !!resultName,
    queryFn: async () => {
      const { records } = await listChildTaskRunRecords({ resultName });
      return (records || []).map(record => JSON.parse(atob(record.data.value)));
    },
    queryKey: ['results', 'childTaskRuns', resultName]
  });

  if (!isFromResults) {
    return k8sQuery;
  }

  return {
    data: resultsQuery.data || [],
    error: resultsQuery.error,
    isPending: resultsQuery.isPending
  };
}

export function cancelPipelineRun({ name, namespace, status = 'Cancelled' }) {
  const payload = [{ op: 'replace', path: '/spec/status', value: status }];

  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { name, namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return patch(uri, payload);
}

export function deletePipelineRun({ name, namespace }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { name, namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return deleteRequest(uri);
}

export function createPipelineRunRaw({ namespace, payload }) {
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { namespace },
    version: getTektonPipelinesAPIVersion()
  });
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
  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return post(uri, payload).then(({ body }) => body);
}

export function generateNewPipelineRunPayload({ pipelineRun, rerun }) {
  const { annotations, labels, name, namespace, generateName } =
    pipelineRun.metadata;

  const payload = structuredClone(pipelineRun);
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

  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return post(uri, payload).then(({ body }) => body);
}

export function startPipelineRun(pipelineRun) {
  const { name, namespace } = pipelineRun.metadata;

  const payload = [{ op: 'remove', path: '/spec/status' }];

  const uri = getKubeAPI({
    group: tektonAPIGroup,
    kind: 'pipelineruns',
    params: { name, namespace },
    version: getTektonPipelinesAPIVersion()
  });
  return patch(uri, payload);
}
