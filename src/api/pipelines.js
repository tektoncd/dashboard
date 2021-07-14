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

import { deleteRequest, get } from './comms';
import {
  checkData,
  getQueryParams,
  getTektonAPI,
  useCollection,
  useResource
} from './utils';

export function getPipelines({ filters = [], namespace } = {}) {
  const uri = getTektonAPI('pipelines', { namespace }, getQueryParams(filters));
  return get(uri).then(checkData);
}

export function getPipeline({ name, namespace }) {
  const uri = getTektonAPI('pipelines', { name, namespace });
  return get(uri);
}

export function deletePipeline({ name, namespace }) {
  const uri = getTektonAPI('pipelines', { name, namespace });
  return deleteRequest(uri);
}

export function usePipelines(params) {
  return useCollection('Pipeline', getPipelines, params);
}

export function usePipeline(params, queryConfig) {
  return useResource('Pipeline', getPipeline, params, queryConfig);
}
