/*
Copyright 2019-2022 The Tekton Authors
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

import {
  checkStatus,
  get,
  getAPIRoot,
  getHeaders,
  getPatchHeaders,
  post,
  request
} from './comms';
import { rest, server } from '../../config_frontend/msw';

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

  it('handles no content response', () => {
    const status = 204;
    const response = {
      ok: true,
      status
    };
    expect(checkStatus(response)).toEqual({});
  });

  it('throws an error on failure', () => {
    const status = 400;
    expect(() => checkStatus({ status })).toThrow();
  });

  it('throws an error on empty response', () => {
    expect(() => checkStatus()).toThrow();
  });

  it('handles 404 with missing statusText', () => {
    const status = 404;
    expect(() => checkStatus({ status })).toThrowError('Not Found');
  });
});

describe('request', () => {
  it('returns the response from the given uri', () => {
    const data = {
      fake: 'data'
    };
    server.use(rest.get(uri, (req, res, ctx) => res(ctx.json(data))));
    return request(uri).then(response => {
      expect(response).toEqual(data);
    });
  });

  it('throws on error', () => {
    server.use(rest.get(uri, (req, res, ctx) => res(ctx.status(400))));
    expect.assertions(1);
    return request(uri).catch(e => {
      expect(e).not.toBeNull();
    });
  });
});

describe('get', () => {
  it('makes a get request with the default headers', () => {
    const data = {
      fake: 'data'
    };
    server.use(rest.get(uri, (req, res, ctx) => res(ctx.json(data))));
    return get(uri).then(response => {
      expect(response).toEqual(data);
    });
  });
});

// TODO: re-enable this after MSW update for Node.js 18 issues
xdescribe('post', () => {
  it('makes a post request with the default headers and provided body', () => {
    const data = {
      fake: 'data'
    };
    server.use(
      // echo the received body so we can assert on it
      rest.post(uri, async (req, res, ctx) => res(ctx.json(await req.json())))
    );
    return post(uri, data).then(responseBody => {
      expect(responseBody).toEqual(data);
    });
  });
});
