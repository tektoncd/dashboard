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

import { useEffect, useRef } from 'react';

export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/* istanbul ignore next */
export function useTitleSync({ page, resourceName }) {
  useEffect(() => {
    const pageTitle = page + (resourceName ? ` - ${resourceName}` : '');
    document.title = `Tekton Dashboard | ${pageTitle}`;
  }, [resourceName]);
}

export function useWebSocketReconnected(callback, webSocketConnected) {
  const prevWebSocketConnected = usePrevious(webSocketConnected);

  useEffect(() => {
    if (prevWebSocketConnected === false && webSocketConnected) {
      callback();
    }
  }, [prevWebSocketConnected, webSocketConnected]);
}
