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

import { act, renderHook } from '@testing-library/react-hooks';

import * as comms from './comms';
import * as utils from './utils';
import {
  getQueryParams,
  removeSystemAnnotations,
  removeSystemLabels,
  useCollection,
  useResource,
  useWebSocket
} from './utils';
import { getAPIWrapper, getQueryClient, getWebSocket } from '../utils/test';

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

describe('getQueryParams', () => {
  it('should handle label filters', () => {
    const filters = ['fakeLabel=fakeValue'];
    expect(getQueryParams({ filters })).toEqual({ labelSelector: filters });
    expect(getQueryParams({ filters: [] })).toEqual('');
  });

  it('should handle name for a single resource', () => {
    const name = 'fake_name';
    expect(getQueryParams({ name })).toEqual({
      fieldSelector: `metadata.name=${name}`
    });
  });

  it('should handle involvedObject for events', () => {
    const involvedObjectKind = 'fake_kind';
    const involvedObjectName = 'fake_name';
    expect(getQueryParams({ involvedObjectKind, involvedObjectName })).toEqual({
      fieldSelector: [
        `involvedObject.kind=${involvedObjectKind}`,
        `involvedObject.name=${involvedObjectName}`
      ]
    });
  });
});

describe('useWebSocket', () => {
  const kind = 'TaskRun';
  const resourceVersion = 'fake_resourceVersion';
  const url = 'http://localhost/fake_url';

  it('should handle ADDED events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();
    vi.spyOn(comms, 'createWebSocket').mockImplementation(() => webSocket);
    vi.spyOn(queryClient, 'invalidateQueries');
    const existingResource = { metadata: { uid: 'existing-id' } };
    const newResource = { kind, metadata: { uid: 'new-uid' } };

    queryClient.setQueryData([kind], () => ({
      items: [existingResource],
      metadata: {}
    }));

    renderHook(() => useWebSocket({ kind, resourceVersion, url }), {
      wrapper: getAPIWrapper({ queryClient })
    });

    expect(comms.createWebSocket).toHaveBeenCalledWith(
      `${url}?resourceVersion=${resourceVersion}`
    );

    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          type: 'ADDED',
          object: newResource
        })
      });
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith([kind]);
  });

  it('should handle DELETED events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();
    vi.spyOn(comms, 'createWebSocket').mockImplementation(() => webSocket);

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

    queryClient.setQueryData([kind], () => ({
      items: [resource1, resource2, resource3],
      metadata: {}
    }));
    queryClient.setQueryData([kind, { name, namespace }], () => resource2);
    queryClient.setQueryData(
      [kind, { name: otherName, namespace }],
      () => resource3
    );

    vi.spyOn(queryClient, 'removeQueries');

    renderHook(() => useWebSocket({ kind, resourceVersion, url }), {
      wrapper: getAPIWrapper({ queryClient })
    });

    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          type: 'DELETED',
          object: resource2
        })
      });
    });
    expect(queryClient.getQueryData([kind])).toEqual({
      items: [resource1, resource3],
      metadata: {}
    });
    expect(
      queryClient.getQueryData([kind, { name: otherName, namespace }])
    ).toEqual(resource3);
    expect(queryClient.removeQueries).toHaveBeenCalledWith([
      kind,
      { name, namespace }
    ]);
  });

  it('should handle MODIFIED events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();
    vi.spyOn(comms, 'createWebSocket').mockImplementation(() => webSocket);
    const name = 'resource-name';

    const existingResource = {
      kind,
      metadata: { name, uid: 'existing-id', resourceVersion: '10' }
    };
    const staleResource = {
      kind,
      metadata: { ...existingResource.metadata, resourceVersion: '9' }
    };
    const updatedResource = {
      kind,
      metadata: { ...existingResource.metadata, resourceVersion: '11' }
    };

    queryClient.setQueryData([kind], () => ({
      items: [existingResource],
      metadata: {}
    }));
    queryClient.setQueryData([kind, { name }], () => existingResource);

    renderHook(() => useWebSocket({ kind, resourceVersion, url }), {
      wrapper: getAPIWrapper({ queryClient })
    });

    // should ignore stale update events
    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          type: 'MODIFIED',
          object: staleResource
        })
      });
    });
    expect(queryClient.getQueryData([kind])).toEqual({
      items: [existingResource],
      metadata: {}
    });
    expect(queryClient.getQueryData([kind, { name }])).toEqual(
      existingResource
    );

    // should update cache when a fresh update is received
    act(() => {
      webSocket.fireEvent({
        type: 'message',
        data: JSON.stringify({
          type: 'MODIFIED',
          object: updatedResource
        })
      });
    });
    expect(queryClient.getQueryData([kind])).toEqual({
      items: [updatedResource],
      metadata: {}
    });
    expect(queryClient.getQueryData([kind, { name }])).toEqual(updatedResource);
  });

  it('should handle unsupported events', () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();
    vi.spyOn(comms, 'createWebSocket').mockImplementation(() => webSocket);

    const existingResource = {
      metadata: { uid: 'existing-id' }
    };

    queryClient.setQueryData([kind], () => ({
      items: [existingResource],
      metadata: {}
    }));

    renderHook(() => useWebSocket({ kind, resourceVersion, url }), {
      wrapper: getAPIWrapper({ queryClient })
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
    expect(queryClient.getQueryData([kind])).toEqual({
      items: [existingResource],
      metadata: {}
    });

    act(() => {
      webSocket.fireEvent({
        type: 'non-message-event'
      });
    });
    expect(queryClient.getQueryData([kind])).toEqual({
      items: [existingResource],
      metadata: {}
    });
  });
});

describe('useCollection', () => {
  const kind = 'TaskRun';
  const resourceVersion = 'fake_resourceVersion';
  const webSocketURL = 'http://localhost/fake_url';

  it('should return a valid query response', async () => {
    const queryClient = getQueryClient();
    const webSocket = getWebSocket();
    vi.spyOn(comms, 'createWebSocket').mockImplementation(() => webSocket);

    const existingResource = {
      kind,
      metadata: { uid: 'existing-id', resourceVersion: '10' }
    };
    const updatedResource = {
      kind,
      metadata: { ...existingResource.metadata, resourceVersion: '11' }
    };

    const api = () => ({
      items: [existingResource],
      metadata: { resourceVersion }
    });
    const { result, waitFor, waitForNextUpdate } = renderHook(
      () => useCollection({ api, kind, webSocketURL }),
      {
        wrapper: getAPIWrapper({ queryClient })
      }
    );

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual([existingResource]);

    webSocket.fireEvent({
      type: 'message',
      data: JSON.stringify({
        type: 'MODIFIED',
        object: updatedResource
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
    const webSocketURL = 'http://localhost/fake_url';
    vi.spyOn(comms, 'createWebSocket').mockImplementation(() => webSocket);

    const name = 'resource-name';
    const existingResource = {
      kind,
      metadata: { name, uid: 'existing-id', resourceVersion: '10' }
    };
    const updatedResource = {
      kind,
      metadata: { ...existingResource.metadata, resourceVersion: '11' }
    };

    const api = () => existingResource;
    const { result, waitFor, waitForNextUpdate } = renderHook(
      () => useResource({ api, kind, params: { name }, webSocketURL }),
      {
        wrapper: getAPIWrapper({ queryClient })
      }
    );

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(existingResource);

    webSocket.fireEvent({
      type: 'message',
      data: JSON.stringify({
        type: 'MODIFIED',
        object: updatedResource
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

it('removeSystemAnnotations', () => {
  const customAnnotation = 'myCustomAnnotation';
  const kubectlAnnotation = 'kubectl.kubernetes.io/last-applied-configuration';
  const tektonAnnotation = 'tekton.dev/foo';
  const resource = {
    metadata: {
      annotations: {
        [tektonAnnotation]: 'true',
        [customAnnotation]: 'true',
        [kubectlAnnotation]: 'true'
      }
    }
  };
  removeSystemAnnotations(resource);

  expect(resource.metadata.annotations[customAnnotation]).toBeDefined();
  expect(resource.metadata.annotations[tektonAnnotation]).toBeUndefined();
  expect(resource.metadata.annotations[kubectlAnnotation]).toBeUndefined();
});

it('removeSystemLabels', () => {
  const customLabel = 'myCustomLabel';
  const tektonLabel = 'tekton.dev/foo';
  const resource = {
    metadata: {
      labels: {
        [tektonLabel]: 'true',
        [customLabel]: 'true'
      }
    }
  };
  removeSystemLabels(resource);

  expect(resource.metadata.labels[customLabel]).toBeDefined();
  expect(resource.metadata.labels[tektonLabel]).toBeUndefined();
});
