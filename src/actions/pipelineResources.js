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

import { getPipelineResource, getPipelineResources } from '../api';
import { getSelectedNamespace } from '../reducers';
import { fetchNamespacedCollection } from './actionCreators';

function fetchPipelineResourcesSuccess(data) {
  return {
    type: 'PIPELINE_RESOURCES_FETCH_SUCCESS',
    data
  };
}

export function fetchPipelineResource({ name, namespace }) {
  return async (dispatch, getState) => {
    dispatch({ type: 'PIPELINE_RESOURCES_FETCH_REQUEST' });
    let pipelineResource;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      pipelineResource = await getPipelineResource(name, requestedNamespace);
      dispatch(fetchPipelineResourcesSuccess([pipelineResource]));
    } catch (error) {
      dispatch({ type: 'PIPELINE_RESOURCES_FETCH_FAILURE', error });
    }
    return pipelineResource;
  };
}

export function fetchPipelineResources({ namespace } = {}) {
  return fetchNamespacedCollection('PipelineResource', getPipelineResources, {
    namespace
  });
}
