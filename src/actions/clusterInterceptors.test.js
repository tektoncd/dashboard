/*
Copyright 2021 The Tekton Authors
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
  fetchClusterInterceptor,
  fetchClusterInterceptors
} from './clusterInterceptors';

it('fetchClusterInterceptor', async () => {
  jest.spyOn(creators, 'fetchResource');
  const name = 'ClusterInterceptorName';
  fetchClusterInterceptor({ name });
  expect(creators.fetchResource).toHaveBeenCalledWith(
    'ClusterInterceptor',
    API.getClusterInterceptor,
    { name }
  );
});

it('fetchClusterInterceptors', async () => {
  jest.spyOn(creators, 'fetchCollection');
  const filters = ['someFilter'];
  fetchClusterInterceptors({ filters });
  expect(creators.fetchCollection).toHaveBeenCalledWith(
    'ClusterInterceptor',
    API.getClusterInterceptors,
    { filters }
  );
});

it('fetchClusterInterceptors with no filters', async () => {
  jest.spyOn(creators, 'fetchCollection');
  fetchClusterInterceptors();
  expect(creators.fetchCollection).toHaveBeenCalledWith(
    'ClusterInterceptor',
    API.getClusterInterceptors,
    { filters: undefined }
  );
});
