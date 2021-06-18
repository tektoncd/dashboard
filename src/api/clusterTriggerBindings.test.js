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

import fetchMock from 'fetch-mock';
import * as API from './clusterTriggerBindings';
import * as utils from './utils';

it('getClusterTriggerBinding', () => {
  const name = 'foo';
  const data = { fake: 'clusterTriggerBinding' };
  fetchMock.get(`end:${name}`, data);
  return API.getClusterTriggerBinding({ name }).then(clusterTriggerBinding => {
    expect(clusterTriggerBinding).toEqual(data);
    fetchMock.restore();
  });
});

it('getClusterTriggerBindings', () => {
  const data = {
    items: 'clusterTriggerBindings'
  };
  fetchMock.get(/clustertriggerbindings/, data);
  return API.getClusterTriggerBindings().then(clusterTriggerBindings => {
    expect(clusterTriggerBindings).toEqual(data.items);
    fetchMock.restore();
  });
});

it('useClusterTriggerBindings', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useClusterTriggerBindings(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'ClusterTriggerBinding',
    API.getClusterTriggerBindings,
    params
  );
});

it('useClusterTriggerBinding', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useClusterTriggerBinding(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'ClusterTriggerBinding',
    API.getClusterTriggerBinding,
    params
  );
});
