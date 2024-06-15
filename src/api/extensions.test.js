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

import * as API from './extensions';
import * as utils from './utils';

it('useExtensions', () => {
  const name = 'fake_name';
  const group = 'fake_group';
  const version = 'fake_version';
  const apiVersion = `${group}/${version}`;
  const displayName = 'fake_displayName';
  const namespaced = true;
  const query = {
    data: [{ spec: { apiVersion, displayname: displayName, name, namespaced } }]
  };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  const extensions = API.useExtensions(params);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      group: utils.dashboardAPIGroup,
      kind: 'extensions',
      params,
      version: 'v1alpha1'
    })
  );
  expect(extensions).toEqual({
    data: [
      {
        apiGroup: group,
        apiVersion: version,
        displayName,
        name,
        namespaced
      }
    ]
  });
});
