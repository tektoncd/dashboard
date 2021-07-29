/*
Copyright 2019-2021 The Tekton Authors
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
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import ReconnectingWebSocket from 'reconnecting-websocket';

import './utils/polyfills';
import { configureStore } from './store';
import { getWebSocketURL, WebSocketContext } from './api';
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

const webSocket = new ReconnectingWebSocket(getWebSocketURL());
function closeSocket() {
  webSocket.close();
}

const store = configureStore({ webSocket });

setTheme();

const enableReactQueryDevTools =
  localStorage.getItem('tkn-devtools-rq') === 'true';

ReactDOM.render(
  <WebSocketContext.Provider value={webSocket}>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App lang={getLocale(navigator.language)} onUnload={closeSocket} />
      </Provider>
      {enableReactQueryDevTools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </WebSocketContext.Provider>,
  document.getElementById('root')
);
