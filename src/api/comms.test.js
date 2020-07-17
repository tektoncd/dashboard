/*
Copyright 2019-2020 The Tekton Authors
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

import fetchMock from 'fetch-mock';

import {
  checkStatus,
  get,
  getAPIRoot,
  getHeaders,
  getPatchHeaders,
  post,
  request
} from './comms';
import { mockCSRFToken } from '../utils/test';

const uri = 'http://example.com';

describe('getAPIRoot', () => {
  it('handles base URL with trailing slash', () => {
    window.history.pushState({}, 'Title', '/path/#hash');
    expect(getAPIRoot()).toContain('/path');
  });

  it('handles base URL without trailing slash', () => {
    window.history.pushState({}, 'Title', '/path#hash');
    expect(getAPIRoot()).toContain('/path');
  });
});

describe('getHeaders', () => {
  it('returns default headers when called with no params', () => {
    expect(getHeaders()).not.toBeNull();
  });

  it('combines custom headers with the default', () => {
    const customHeaders = {
      'X-Foo': 'Bar'
    };
    const result = getHeaders(customHeaders);
    expect(result).toMatchObject(customHeaders);
    expect(result).toMatchObject(getHeaders());
  });
});

describe('getPatchHeaders', () => {
  it('returns default headers when called with no params', () => {
    expect(getPatchHeaders()).not.toBeNull();
  });

  it('combines custom headers with the default', () => {
    const customHeaders = {
      'X-Foo': 'Bar'
    };
    const result = getPatchHeaders(customHeaders);
    expect(result).toMatchObject(customHeaders);
    expect(result).toMatchObject(getPatchHeaders());
  });
});

describe('checkStatus', () => {
  it('returns json on success', () => {
    const data = 'fake data';
    const json = jest.fn(() => data);
    expect(
      checkStatus({
        ok: true,
        headers: { get: () => 'application/json' },
        json
      })
    ).toEqual(data);
  });

  it('return text on success', () => {
    const data = 'fake data';
    const text = jest.fn(() => data);
    expect(
      checkStatus({
        ok: true,
        headers: { get: () => 'text/plain' },
        text
      })
    ).toEqual(data);
  });

  it('returns headers on successful create', () => {
    const headers = { get: jest.fn() };
    const status = 201;
    const response = {
      headers,
      json: jest.fn(),
      ok: true,
      status
    };
    expect(checkStatus(response)).toEqual(expect.objectContaining({ headers }));
  });

  it('handles empty response body', () => {
    const headers = { get: () => '0' };
    const status = 201;
    const response = {
      headers,
      ok: true,
      status
    };
    expect(checkStatus(response)).toEqual(
      expect.objectContaining({ body: null, headers })
    );
  });

  it('throws an error on failure', () => {
    const status = 400;
    expect(() => checkStatus({ status })).toThrow();
  });

  it('throws an error on empty response', () => {
    expect(() => checkStatus()).toThrow();
  });
});

describe('request', () => {
  it('returns the response from the given uri', () => {
    const data = {
      fake: 'data'
    };

    fetchMock.mock(uri, data);
    return request(uri).then(response => {
      expect(response).toEqual(data);
      fetchMock.restore();
    });
  });

  it('throws on error', () => {
    fetchMock.mock(uri, 400);
    expect.assertions(1);
    return request(uri).catch(e => {
      expect(e).not.toBeNull();
      fetchMock.restore();
    });
  });
});

describe('get', () => {
  it('makes a get request with the default headers', () => {
    const data = {
      fake: 'data'
    };
    fetchMock.get(uri, data);
    return get(uri).then(response => {
      expect(response).toEqual(data);
      fetchMock.restore();
    });
  });
});

describe('post', () => {
  it('makes a post request with the default headers and provided body', () => {
    const data = {
      fake: 'data'
    };
    mockCSRFToken();
    fetchMock.post(uri, data);
    return post(uri, data).then(() => {
      const options = fetchMock.lastOptions();
      expect(options.body).toEqual(JSON.stringify(data));
      fetchMock.restore();
    });
  });
});
