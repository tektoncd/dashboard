/*
Copyright 2022-2024 The Tekton Authors
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

import * as API from './interceptors';
import * as utils from './utils';

it('useInterceptors', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useInterceptors(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    expect.objectContaining({
      group: utils.triggersAPIGroup,
      kind: 'interceptors',
      params,
      version: 'v1alpha1'
    })
  );
});

it('useInterceptor', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  vi.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useInterceptor(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    expect.objectContaining({
      group: utils.triggersAPIGroup,
      kind: 'interceptors',
      params,
      version: 'v1alpha1'
    })
  );
});
