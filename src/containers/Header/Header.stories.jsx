/*
Copyright 2019-2025 The Tekton Authors
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { withRouter } from 'storybook-addon-remix-react-router';

import Header from '.';
import HeaderBarContent from '../HeaderBarContent';
import { NamespaceContext } from '../../api';

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
  selectedNamespace: 'default',
  selectNamespace: () => {}
};

export default {
  component: Header,
  subcomponents: { HeaderBarContent },
  title: 'Header'
};

export const Default = {};

export const WithContent = {
  args: {
    children: <HeaderBarContent />
  },
  decorators: [
    withRouter(),
    Story => {
      queryClient.setQueryData(['core', 'v1', 'namespaces'], () => ({
        items: namespaces,
        metadata: {}
      }));
      queryClient.setQueryData(['properties'], () => ({
        logoutURL: '/some/url'
      }));

      return (
        <QueryClientProvider client={queryClient}>
          <NamespaceContext.Provider value={namespaceContext}>
            <Story />
          </NamespaceContext.Provider>
        </QueryClientProvider>
      );
    }
  ]
};
