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

import fetchMock from 'fetch-mock';

import { checkStatus, get, getHeaders, post, request } from './comms';

const uri = 'http://example.com';

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

describe('checkStatus', () => {
  it('returns json on success', () => {
    const data = 'fake data';
    const json = jest.fn(() => data);
    expect(checkStatus({ ok: true, json })).toEqual(data);
  });
  
  it('returns headers on successful create', () => {
    const status = 201;
    const headers = { fake: 'headers' };
    expect(checkStatus({ ok: true, headers, status })).toEqual(headers);
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
    fetchMock.post(uri, data);
    return post(uri, data).then(() => {
      const options = fetchMock.lastOptions();
      expect(options.body).toEqual(JSON.stringify(data));
      fetchMock.restore();
    });
  });
});
