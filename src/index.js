/*
Copyright 2019-2022 The Tekton Authors
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
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './utils/polyfills';
import { getLocale, setTheme } from './utils';

import App from './containers/App';

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

setTheme();

const enableReactQueryDevTools =
  localStorage.getItem('tkn-devtools-rq') === 'true';

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <App lang={getLocale(navigator.language)} />
    </React.StrictMode>
    {enableReactQueryDevTools && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>,
  document.getElementById('root')
);
