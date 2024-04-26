/*
Copyright 2021-2024 The Tekton Authors
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

import { paths, urls } from '@tektoncd/dashboard-utils';

import { renderWithRouter } from '../../utils/test';
import * as API from '../../api/clusterInterceptors';
import ClusterInterceptorsContainer from './ClusterInterceptors';

const clusterInterceptor = {
  metadata: {
    name: 'clusterInterceptorWithSingleLabel',
    uid: 'clusterInterceptorWithSingleLabel-id',
    labels: {
      foo: 'bar'
    }
  }
};

describe('ClusterInterceptors', () => {
  it('renders loading state', async () => {
    vi.spyOn(API, 'useClusterInterceptors').mockImplementation(() => ({
      isLoading: true
    }));
    const { queryByText } = renderWithRouter(<ClusterInterceptorsContainer />, {
      path: paths.clusterInterceptors.all(),
      route: urls.clusterInterceptors.all()
    });
    expect(queryByText('ClusterInterceptors')).toBeTruthy();
  });

  it('renders data', async () => {
    vi.spyOn(API, 'useClusterInterceptors').mockImplementation(() => ({
      data: [clusterInterceptor]
    }));
    const { queryByText } = renderWithRouter(<ClusterInterceptorsContainer />, {
      path: paths.clusterInterceptors.all(),
      route: urls.clusterInterceptors.all()
    });

    expect(queryByText('clusterInterceptorWithSingleLabel')).toBeTruthy();
  });

  it('handles error', async () => {
    const error = 'fake_errorMessage';
    vi.spyOn(API, 'useClusterInterceptors').mockImplementation(() => ({
      error
    }));
    const { queryByText } = renderWithRouter(<ClusterInterceptorsContainer />, {
      path: paths.clusterInterceptors.all(),
      route: urls.clusterInterceptors.all()
    });

    expect(queryByText(error)).toBeTruthy();
  });
});
