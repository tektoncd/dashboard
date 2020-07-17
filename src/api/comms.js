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

const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const defaultOptions = {
  method: 'GET',
  credentials: 'same-origin'
};

export function getAPIRoot() {
  const { host, pathname, protocol } = window.location;
  let baseURL = `${protocol}//${host}${pathname}`;
  if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1);
  }
  return baseURL;
}

const apiRoot = getAPIRoot();

export function getHeaders(headers = {}) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers
  };
}

export function getPatchHeaders(headers = {}) {
  return {
    Accept: 'application/json-patch+json',
    'Content-Type': 'application/json-patch+json',
    ...headers
  };
}

function parseBody(response, stream = false) {
  if (stream) {
    return response.body;
  }
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/plain')) {
    return response.text();
  }
  return response.json();
}

export function checkStatus(response = {}, stream = false) {
  if (response.ok) {
    switch (response.status) {
      case 201:
        return {
          headers: response.headers,
          body: parseBody(response, stream)
        };
      case 204:
        return {};
      default:
        return parseBody(response, stream);
    }
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function getToken() {
  return fetch(`${apiRoot}/v1/token`, {
    ...defaultOptions,
    headers: {
      Accept: 'text/plain'
    }
  }).then(response => response.headers.get(CSRF_HEADER));
}

export async function request(uri, options = defaultOptions, stream) {
  let token;
  if (!CSRF_SAFE_METHODS.includes(options.method)) {
    token = await getToken();
  }

  const headers = {
    ...options.headers,
    ...(token && { [CSRF_HEADER]: token })
  };

  return fetch(uri, {
    ...defaultOptions,
    ...options,
    headers
  }).then(response => checkStatus(response, stream));
}

export function get(uri, headers, options = {}) {
  return request(
    uri,
    {
      method: 'GET',
      headers: getHeaders(headers)
    },
    options.stream
  );
}

export function post(uri, body) {
  return request(uri, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
}

export function put(uri, body) {
  return request(uri, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
}

export function patch(uri, body) {
  return request(uri, {
    method: 'PATCH',
    headers: getPatchHeaders(),
    body: JSON.stringify(body)
  });
}

export function deleteRequest(uri) {
  return request(uri, {
    method: 'DELETE',
    headers: getHeaders()
  });
}
