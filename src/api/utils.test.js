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

import { act, renderHook } from '@testing-library/react-hooks';

import * as utils from './utils';
import { useCollection, useResource, useWebSocket } from './utils';
import { getAPIWrapper, getQueryClient, getWebSocket } from '../utils/test';

describe('getAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = utils.getAPI('pipelines');
    expect(uri).toContain('pipelines');
  });

  it('returns a URI containing the given type and name', () => {
    const uri = utils.getAPI('pipelines', { name: 'somename' });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
  });

  it('returns a URI containing the given type, name, and namespace', () => {
    const uri = utils.getAPI('pipelines', {
      name: 'somename',
      namespace: 'customnamespace'
    });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
    expect(uri).toContain('customnamespace');
  });
});

describe('getTektonAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = utils.getTektonAPI('pipelines');
    expect(uri).toContain('pipelines');
  });

  it('returns a URI containing the given type and name', () => {
    const uri = utils.getTektonAPI('pipelines', { name: 'somename' });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
  });

  it('returns a URI containing the given type, name, and namespace', () => {
    const uri = utils.getTektonAPI('pipelines', {
      name: 'somename',
      namespace: 'customnamespace'
    });
    expect(uri).toContain('pipelines');
    expect(uri).toContain('somename');
    expect(uri).toContain('namespaces');
    expect(uri).toContain('customnamespace');
  });

  it('returns a URI without namespace when omitted', () => {
    const uri = utils.getTektonAPI('clustertasks', {
      name: 'somename'
    });
    expect(uri).toContain('clustertasks');
    expect(uri).toContain('somename');
    expect(uri).not.toContain('namespaces');
  });
});

describe('getResourcesAPI', () => {
  it('returns a URI containing the given type', () => {
    const uri = utils.getResourcesAPI({
      group: 'test.dev',
      version: 'testversion',
      type: 'testtype'
    });
    expect(uri).toContain('test.dev');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
  });

  it('returns a URI containing the given type and name without namespace', () => {
    const uri = utils.getResourcesAPI({
      group: 'test.dev',
      version: 'testversion',
      type: 'testtype',
      name: 'testname'
    });
    expect(uri).toContain('test.dev');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
    expect(uri).toContain('testname');
    expect(uri).not.toContain('namespaces');
  });

  it('returns a URI containing the given type, name and namespace', () => {
    const uri = utils.getResourcesAPI({
      group: 'test.dev',
      version: 'testversion',
      type: 'testtype',
      namespace: 'testnamespace',
      name: 'testname'
    });
    expect(uri).toContain('test.dev');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
    expect(uri).toContain('testname');
    expect(uri).toContain('namespaces');
    expect(uri).toContain('testnamespace');
  });

  it('handles the core group correctly', () => {
    const uri = utils.getResourcesAPI({
      group: 'core',
      version: 'testversion',
      type: 'testtype',
      namespace: 'testnamespace',
      name: 'testname'
    });
    expect(uri).not.toContain('core');
    expect(uri).toContain('api');
    expect(uri).not.toContain('apis');
    expect(uri).toContain('testversion');
    expect(uri).toContain('testtype');
    expect(uri).toContain('testname');
    expect(uri).toContain('namespaces');
    expect(uri).toContain('testnamespace');
  });
});

describe('checkData', () => {
  it('returns items if present', () => {
    const items = 'foo';
    const data = {
      items
    };
    expect(utils.checkData(data)).toEqual(items);
  });

  it('throws an error if items is not present', () => {
    expect(() => utils.checkData({})).toThrow();
  });
});

describe('useWebSocket', () => {
  const kind = 'TaskRun';
  it('should handle Created events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();

    jest.spyOn(queryClient, 'invalidateQueries');
    const existingResource = { metadata: { uid: 'existing-id' } };
    const newResource = { kind, metadata: { uid: 'new-uid' } };

    queryClient.setQueryData(kind, () => [existingResource]);

    renderHook(() => useWebSocket({ kind }), {
      wrapper: getAPIWrapper({ queryClient, webSocket })
    });

    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          kind,
          operation: 'Created',
          payload: newResource
        })
      });
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(kind);
  });

  it('should handle Deleted events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();

    const name = 'resource-name';
    const otherName = 'other-resource-name';
    const namespace = 'resource-namespace';
    const resource1 = { kind, metadata: { uid: 'existing-id-1' } };
    const resource2 = {
      kind,
      metadata: { name, namespace, uid: 'existing-id-2' }
    };
    const resource3 = {
      kind,
      metadata: { name: otherName, namespace, uid: 'existing-id-3' }
    };

    queryClient.setQueryData(kind, () => [resource1, resource2, resource3]);
    queryClient.setQueryData([kind, { name, namespace }], () => resource2);
    queryClient.setQueryData(
      [kind, { name: otherName, namespace }],
      () => resource3
    );

    jest.spyOn(queryClient, 'removeQueries');

    renderHook(() => useWebSocket({ kind }), {
      wrapper: getAPIWrapper({ queryClient, webSocket })
    });

    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          kind,
          operation: 'Deleted',
          payload: resource2
        })
      });
    });
    expect(queryClient.getQueryData(kind)).toEqual([resource1, resource3]);
    expect(
      queryClient.getQueryData([kind, { name: otherName, namespace }])
    ).toEqual(resource3);
    expect(queryClient.removeQueries).toHaveBeenCalledWith([
      kind,
      { name, namespace }
    ]);
  });

  it('should handle Updated events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();
    const name = 'resource-name';

    const existingResource = {
      metadata: { name, uid: 'existing-id', resourceVersion: '10' }
    };
    const staleResource = {
      metadata: { ...existingResource.metadata, resourceVersion: '9' }
    };
    const updatedResource = {
      metadata: { ...existingResource.metadata, resourceVersion: '11' }
    };

    queryClient.setQueryData(kind, () => [existingResource]);
    queryClient.setQueryData([kind, { name }], () => existingResource);

    renderHook(() => useWebSocket({ kind }), {
      wrapper: getAPIWrapper({ queryClient, webSocket })
    });

    // should ignore stale update events
    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          kind,
          operation: 'Updated',
          payload: staleResource
        })
      });
    });
    expect(queryClient.getQueryData(kind)).toEqual([existingResource]);
    expect(queryClient.getQueryData([kind, { name }])).toEqual(
      existingResource
    );

    // should update cache when a fresh update is received
    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          kind,
          operation: 'Updated',
          payload: updatedResource
        })
      });
    });
    expect(queryClient.getQueryData(kind)).toEqual([updatedResource]);
    expect(queryClient.getQueryData([kind, { name }])).toEqual(updatedResource);
  });

  it('should handle unsupported events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();

    const existingResource = {
      metadata: { uid: 'existing-id' }
    };

    queryClient.setQueryData(kind, () => [existingResource]);

    renderHook(() => useWebSocket({ kind }), {
      wrapper: getAPIWrapper({ queryClient, webSocket })
    });

    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          kind,
          operation: 'SomeUnsupportedOperation'
        })
      });
    });
    expect(queryClient.getQueryData(kind)).toEqual([existingResource]);

    act(() => {
      webSocket.fireEvent({
        type: 'non-message-event'
      });
    });
    expect(queryClient.getQueryData(kind)).toEqual([existingResource]);
  });
});

describe('useCollection', () => {
  const kind = 'TaskRun';
  it('should return a valid query response', async () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();

    const existingResource = {
      metadata: { uid: 'existing-id', resourceVersion: '10' }
    };
    const updatedResource = {
      metadata: { ...existingResource.metadata, resourceVersion: '11' }
    };

    const api = () => [existingResource];
    const { result, waitFor, waitForNextUpdate } = renderHook(
      () => useCollection(kind, api),
      {
        wrapper: getAPIWrapper({ queryClient, webSocket })
      }
    );

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual([existingResource]);

    webSocket.fireEvent({
      type: 'message',
      data: JSON.stringify({
        kind,
        operation: 'Updated',
        payload: updatedResource
      })
    });
    await waitForNextUpdate();
    expect(result.current.data).toEqual([updatedResource]);
  });
});

describe('useResource', () => {
  const kind = 'TaskRun';
  it('should return a valid query response', async () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();

    const name = 'resource-name';
    const existingResource = {
      metadata: { name, uid: 'existing-id', resourceVersion: '10' }
    };
    const updatedResource = {
      metadata: { ...existingResource.metadata, resourceVersion: '11' }
    };

    const api = () => existingResource;
    const { result, waitFor, waitForNextUpdate } = renderHook(
      () => useResource(kind, api, { name }),
      {
        wrapper: getAPIWrapper({ queryClient, webSocket })
      }
    );

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(existingResource);

    webSocket.fireEvent({
      type: 'message',
      data: JSON.stringify({
        kind,
        operation: 'Updated',
        payload: updatedResource
      })
    });
    await waitForNextUpdate();
    expect(result.current.data).toEqual(updatedResource);
  });
});

describe('isLogTimestampsEnabled', () => {
  afterEach(() => {
    localStorage.removeItem('tkn-logs-timestamps');
  });

  it('handles valid values', () => {
    localStorage.setItem('tkn-logs-timestamps', true);
    expect(utils.isLogTimestampsEnabled()).toBe(true);
    localStorage.setItem('tkn-logs-timestamps', false);
    expect(utils.isLogTimestampsEnabled()).toBe(false);
  });

  it('handles invalid values', () => {
    localStorage.setItem('tkn-logs-timestamps', 'foo');
    expect(utils.isLogTimestampsEnabled()).toBe(false);
  });
});

describe('isLogTimestampsEnabled', () => {
  afterEach(() => {
    localStorage.removeItem('tkn-logs-timestamps');
  });

  it('handles valid values', () => {
    localStorage.setItem('tkn-logs-timestamps', true);
    expect(utils.isLogTimestampsEnabled()).toBe(true);
    localStorage.setItem('tkn-logs-timestamps', false);
    expect(utils.isLogTimestampsEnabled()).toBe(false);
  });

  it('handles invalid values', () => {
    localStorage.setItem('tkn-logs-timestamps', 'foo');
    expect(utils.isLogTimestampsEnabled()).toBe(false);
  });
});

describe('setLogTimestampsEnabled', () => {
  afterEach(() => {
    localStorage.removeItem('tkn-logs-timestamps');
  });

  it('persists the specified value', () => {
    utils.setLogTimestampsEnabled(true);
    expect(localStorage.getItem('tkn-logs-timestamps')).toEqual('true');

    utils.setLogTimestampsEnabled(false);
    expect(localStorage.getItem('tkn-logs-timestamps')).toEqual('false');
  });
});
