/*
Copyright 2020 The Tekton Authors
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

import * as API from '../api';
import * as creators from './actionCreators';
import {
  fetchClusterTriggerBinding,
  fetchClusterTriggerBindings
} from './clusterTriggerBindings';

it('fetchClusterTriggerBinding', async () => {
  jest.spyOn(creators, 'fetchResource');
  const name = 'ClusterTriggerBindingName';
  fetchClusterTriggerBinding({ name });
  expect(creators.fetchResource).toHaveBeenCalledWith(
    'ClusterTriggerBinding',
    API.getClusterTriggerBinding,
    { name }
  );
});

it('fetchClusterTriggerBindings', async () => {
  jest.spyOn(creators, 'fetchCollection');
  const filters = ['someFilter'];
  fetchClusterTriggerBindings({ filters });
  expect(creators.fetchCollection).toHaveBeenCalledWith(
    'ClusterTriggerBinding',
    API.getClusterTriggerBindings,
    { filters }
  );
});

it('fetchClusterTriggerBindings with no filters', async () => {
  jest.spyOn(creators, 'fetchCollection');
  fetchClusterTriggerBindings();
  expect(creators.fetchCollection).toHaveBeenCalledWith(
    'ClusterTriggerBinding',
    API.getClusterTriggerBindings,
    { filters: undefined }
  );
});
