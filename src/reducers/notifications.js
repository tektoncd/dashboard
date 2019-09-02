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

const initialState = {
  webSocketConnected: null
};

export default function notification(state = initialState, action) {
  switch (action.type) {
    case 'WEBSOCKET_CONNECTED':
      return { ...state, webSocketConnected: true };
    case 'WEBSOCKET_DISCONNECTED':
      return { ...state, webSocketConnected: false };
    default:
      return state;
  }
}

export function isWebSocketConnected(state) {
  return state.webSocketConnected;
}
