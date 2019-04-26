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

import { getExtensionBundleURL, getExtensions } from '../api';

export function fetchExtensionsSuccess(data) {
  return {
    type: 'EXTENSIONS_FETCH_SUCCESS',
    data
  };
}

export function fetchExtensions() {
  return async dispatch => {
    dispatch({ type: 'EXTENSIONS_FETCH_REQUEST' });
    let extensions;
    try {
      extensions = await getExtensions();
      extensions = (extensions || []).map(
        ({ bundlelocation, displayname, name, url }) => ({
          displayName: displayname,
          name,
          source: getExtensionBundleURL(name, bundlelocation),
          url
        })
      );
      dispatch(fetchExtensionsSuccess(extensions));
    } catch (error) {
      dispatch({ type: 'EXTENSIONS_FETCH_FAILURE', error });
    }
    return extensions;
  };
}
