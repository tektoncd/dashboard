/*
Copyright 2019 The Tekton Authors
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
import ReconnectingWebSocket from 'reconnecting-websocket';

import './utils/polyfills';
import { configureStore } from './store';
import { getWebSocketURL } from './api';
import { setLocale } from './actions/locale';

import App from './containers/App';

const webSocket = new ReconnectingWebSocket(getWebSocketURL());
function closeSocket() {
  webSocket.close();
}

const store = configureStore({ webSocket });

store.dispatch(setLocale(navigator.language));

ReactDOM.render(
  <Provider store={store}>
    <App onUnload={closeSocket} />
  </Provider>,
  document.getElementById('root')
);
