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

import { getPipeline, getPipelines } from '../api';
import { getSelectedNamespace } from '../reducers';

export function fetchPipelinesSuccess(data, namespace) {
  return {
    type: 'PIPELINES_FETCH_SUCCESS',
    data,
    namespace
  };
}

export function fetchPipeline(name) {
  return async (dispatch, getState) => {
    dispatch({ type: 'PIPELINES_FETCH_REQUEST' });
    let pipeline;
    try {
      const namespace = getSelectedNamespace(getState());
      pipeline = await getPipeline(name, namespace);
      dispatch(fetchPipelinesSuccess([pipeline], namespace));
    } catch (error) {
      dispatch({ type: 'PIPELINES_FETCH_FAILURE', error });
    }
    return pipeline;
  };
}

export function fetchPipelines() {
  return async (dispatch, getState) => {
    dispatch({ type: 'PIPELINES_FETCH_REQUEST' });
    let pipelines;
    try {
      const namespace = getSelectedNamespace(getState());
      pipelines = await getPipelines(namespace);
      dispatch(fetchPipelinesSuccess(pipelines, namespace));
    } catch (error) {
      dispatch({ type: 'PIPELINES_FETCH_FAILURE', error });
    }
    return pipelines;
  };
}
