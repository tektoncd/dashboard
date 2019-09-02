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

import notificationsReducer, * as selectors from './notifications';

it('handles init or unknown actions', () => {
  expect(notificationsReducer(undefined, { type: 'does_not_exist' })).toEqual({
    webSocketConnected: null
  });
});

it('WEBSOCKET_CONNECTED', () => {
  const action = { type: 'WEBSOCKET_CONNECTED' };
  const state = notificationsReducer({}, action);
  expect(selectors.isWebSocketConnected(state)).toBe(true);
});

it('WEBSOCKET_DISCONNECTED', () => {
  const action = { type: 'WEBSOCKET_DISCONNECTED' };
  const state = notificationsReducer({}, action);
  expect(selectors.isWebSocketConnected(state)).toBe(false);
});
