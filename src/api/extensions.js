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

import { get } from './comms';
import { apiRoot, dashboardAPIGroup, getResourcesAPI } from './utils';

export function getExtensionBaseURL(name) {
  return `${apiRoot}/v1/extensions/${name}`;
}

export function getExtensionBundleURL(name, bundlelocation) {
  return `${getExtensionBaseURL(name)}/${bundlelocation}`;
}

export async function getExtensions({ namespace } = {}) {
  const uri = `${apiRoot}/v1/extensions`;
  const resourceExtensionsUri = getResourcesAPI({
    group: dashboardAPIGroup,
    version: 'v1alpha1',
    type: 'extensions',
    namespace
  });
  let extensions = await get(uri);
  const resourceExtensions = await get(resourceExtensionsUri);
  extensions = (extensions || []).map(
    ({ bundlelocation, displayname, name }) => ({
      displayName: displayname,
      name,
      source: getExtensionBundleURL(name, bundlelocation)
    })
  );
  return extensions.concat(
    ((resourceExtensions && resourceExtensions.items) || []).map(({ spec }) => {
      const { displayname: displayName, name, namespaced } = spec;
      const [apiGroup, apiVersion] = spec.apiVersion.split('/');
      return {
        apiGroup,
        apiVersion,
        displayName,
        extensionType: 'kubernetes-resource',
        name,
        namespaced
      };
    })
  );
}
