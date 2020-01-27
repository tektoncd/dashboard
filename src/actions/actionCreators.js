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

import { getSelectedNamespace } from '../reducers';
import { typeToPlural } from '../utils';

export function fetchSuccess(resourceType, data) {
  const pluralType = typeToPlural(resourceType);
  return {
    type: `${pluralType}_FETCH_SUCCESS`,
    data
  };
}

export function fetchCollection(resourceType, api, params) {
  const pluralType = typeToPlural(resourceType);
  return async dispatch => {
    dispatch({ type: `${pluralType}_FETCH_REQUEST` });
    let data;
    try {
      data = await api({ ...params });
      dispatch(fetchSuccess(resourceType, data));
    } catch (error) {
      dispatch({ type: `${pluralType}_FETCH_FAILURE`, error });
    }
    return data;
  };
}

export function fetchNamespacedCollection(
  resourceType,
  api,
  { namespace, ...rest }
) {
  const pluralType = typeToPlural(resourceType);
  return async (dispatch, getState) => {
    dispatch({ type: `${pluralType}_FETCH_REQUEST` });
    let data;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      data = await api({ namespace: requestedNamespace, ...rest });
      dispatch(fetchSuccess(resourceType, data));
    } catch (error) {
      dispatch({ type: `${pluralType}_FETCH_FAILURE`, error });
    }
    return data;
  };
}

export function fetchResource(resourceType, api, { ...rest }) {
  const pluralType = typeToPlural(resourceType);
  return async dispatch => {
    dispatch({ type: `${pluralType}_FETCH_REQUEST` });
    let data;
    try {
      data = await api({ ...rest });
      dispatch(fetchSuccess(resourceType, [data]));
    } catch (error) {
      dispatch({ type: `${pluralType}_FETCH_FAILURE`, error });
    }
    return data;
  };
}

export function fetchNamespacedResource(
  resourceType,
  api,
  { namespace, ...rest }
) {
  const pluralType = typeToPlural(resourceType);
  return async (dispatch, getState) => {
    dispatch({ type: `${pluralType}_FETCH_REQUEST` });
    let data;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      data = await api({ namespace: requestedNamespace, ...rest });
      dispatch(fetchSuccess(resourceType, [data]));
    } catch (error) {
      dispatch({ type: `${pluralType}_FETCH_FAILURE`, error });
    }
    return data;
  };
}
