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

import { renderHook } from '@testing-library/react-hooks';

import { usePrevious, useWebSocketReconnected } from './hooks';

describe('hooks', () => {
  it('usePrevious', () => {
    let initialValue = 0;
    const { result, rerender } = renderHook(() => usePrevious(initialValue));

    initialValue = 10;
    rerender();
    expect(result.current).toEqual(0);

    initialValue = 1;
    rerender();
    expect(result.current).toEqual(10);
  });

  it('useWebSocketReconnected', () => {
    const callback = jest.fn();
    let webSocketConnected;

    const { rerender } = renderHook(() =>
      useWebSocketReconnected(callback, webSocketConnected)
    );
    expect(callback).not.toHaveBeenCalled();
    webSocketConnected = true;
    rerender();
    expect(callback).not.toHaveBeenCalled();
    webSocketConnected = false;
    rerender();
    expect(callback).not.toHaveBeenCalled();
    // callback is only called if websocket was previously disconnected
    // i.e. doesn't get called on initial connection
    webSocketConnected = true;
    rerender();
    expect(callback).toHaveBeenCalled();
  });
});
