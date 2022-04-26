/*
Copyright 2020-2022 The Tekton Authors
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
import { Table } from '@tektoncd/dashboard-components';
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

const namespaceContext = {
  selectedNamespace: ALL_NAMESPACES,
  selectNamespace: () => {}
};

export default {
  args: {
    hideNamespacesDropdown: false,
    title: 'PipelineRuns'
  },
  component: ListPageLayoutContainer,
  decorators: [
    Story => {
      queryClient.setQueryData('Namespace', () => ({
        items: namespaces,
        metadata: {}
      }));

      return (
        <QueryClientProvider client={queryClient}>
          <NamespaceContext.Provider value={namespaceContext}>
            <Story />
          </NamespaceContext.Provider>
        </QueryClientProvider>
      );
    }
  ],
  title: 'Containers/ListPageLayout'
};

export const Base = args => (
  <ListPageLayoutContainer {...args}>
    {() => <span>page content goes here</span>}
  </ListPageLayoutContainer>
);

export const WithFilters = args => (
  <ListPageLayoutContainer filters={[]} {...args}>
    {() => <span>page content goes here</span>}
  </ListPageLayoutContainer>
);

export const WithPagination = args => (
  <ListPageLayoutContainer
    filters={[]}
    resources={Array.from({ length: 30 }, (_, index) => ({
      id: index,
      value: `Row ${index + 1}`
    }))}
    {...args}
  >
    {({ resources }) => (
      <Table headers={[{ key: 'value', header: 'Value' }]} rows={resources} />
    )}
  </ListPageLayoutContainer>
);
