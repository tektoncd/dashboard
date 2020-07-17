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

import fetchMock from 'fetch-mock';
import * as API from './clusterTriggerBindings';

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
