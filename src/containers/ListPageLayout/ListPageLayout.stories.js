/*
Copyright 2020-2021 The Tekton Authors
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

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';

import ListPageLayoutContainer from './ListPageLayout';
import { NamespaceContext } from '../../api/utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity
    }
  }
});

const namespaces = [
  'default',
  'kube-public',
  'kube-system',
  'tekton-pipelines'
].map(namespace => ({ metadata: { name: namespace } }));

const props = {
  history: { push: () => {} },
  location: {},
  match: { path: '/' }
};

export default {
  component: ListPageLayoutContainer,
  decorators: [
    storyFn => {
      queryClient.setQueryData('Namespace', () => ({
        items: namespaces,
        metadata: {}
      }));

      return (
        <QueryClientProvider client={queryClient}>
          <NamespaceContext.Provider
            value={{
              selectedNamespace: ALL_NAMESPACES,
              selectNamespace: () => {}
            }}
          >
            {storyFn()}
          </NamespaceContext.Provider>
        </QueryClientProvider>
      );
    }
  ],
  title: 'Containers/ListPageLayout'
};

export const Base = args => (
  <ListPageLayoutContainer {...props} {...args}>
    page content goes here
  </ListPageLayoutContainer>
);
Base.args = {
  hideNamespacesDropdown: false,
  title: 'PipelineRuns'
};

export const WithFilters = args => (
  <ListPageLayoutContainer {...props} filters={[]} {...args}>
    page content goes here
  </ListPageLayoutContainer>
);
WithFilters.args = {
  hideNamespacesDropdown: false,
  title: 'PipelineRuns'
};
