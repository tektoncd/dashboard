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
/* istanbul ignore file */

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  render as baseRender,
  renderWithRouter as baseRenderWithRouter
} from '@tektoncd/dashboard-components/src/utils/test';

import { NamespaceContext, WebSocketContext } from '../api/utils';

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: Infinity
      }
    }
  });
}

export function getWebSocket() {
  return {
    listener: null,
    addEventListener(type, listener) {
      this.listener = listener;
    },
    removeEventListener() {},
    fireEvent(event) {
      this.listener(event);
    }
  };
}

export function getAPIWrapper({
  queryClient = getQueryClient(),
  webSocket = getWebSocket()
} = {}) {
  return function apiWrapper({ children }) {
    return (
      <WebSocketContext.Provider value={webSocket}>
        <NamespaceContext.Provider
          value={{ selectedNamespace: null, selectNamespace: () => {} }}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </NamespaceContext.Provider>
      </WebSocketContext.Provider>
    );
  };
}

export function render(ui, { queryClient, rerender, webSocket } = {}) {
  return (rerender || baseRender)(ui, {
    wrapper: getAPIWrapper({ queryClient, webSocket })
  });
}

export function renderWithRouter(
  ui,
  { queryClient, rerender, webSocket, ...rest } = {}
) {
  return (rerender || baseRenderWithRouter)(ui, {
    wrapper: getAPIWrapper({ queryClient, webSocket }),
    ...rest
  });
}
