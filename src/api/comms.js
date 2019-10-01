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

const defaultOptions = {
  method: 'get',
  credentials: 'same-origin'
};

export function getHeaders(headers = {}) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers
  };
}

export function checkStatus(response = {}) {
  if (response.ok) {
    switch (response.status) {
      case 201:
        return response.headers;
      case 204:
        return {};
      default:
        if (response.headers.get('content-type') === 'text/plain') {
          return response.text();
        }
        return response.json();
    }
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

export function request(uri, options) {
  return fetch(uri, {
    ...defaultOptions,
    ...options
  }).then(checkStatus);
}

export function get(uri, headers) {
  return request(uri, {
    method: 'get',
    headers: getHeaders(headers)
  });
}

export function post(uri, body) {
  return request(uri, {
    method: 'post',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
}

export function put(uri, body) {
  return request(uri, {
    method: 'put',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
}

export function deleteRequest(uri) {
  return request(uri, {
    method: 'delete',
    headers: getHeaders()
  });
}
