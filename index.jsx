/*
Copyright 2019-2024 The Tekton Authors
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

import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { defaultQueryFn } from './src/api/utils';
import { setTheme } from './src/utils';
import App from './src/containers/App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5 minutes
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity
    }
  }
});

setTheme();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <App />
    </StrictMode>
  </QueryClientProvider>,
  document.getElementById('root')
);
