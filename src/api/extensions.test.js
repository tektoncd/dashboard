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
import * as API from './extensions';

it('getExtensions', () => {
  const displayName = 'displayName';
  const name = 'name';
  const bundlelocation = 'bundlelocation';
  const source = API.getExtensionBundleURL(name, bundlelocation);
  const extensions = [{ displayname: displayName, name, bundlelocation }];
  const transformedExtensions = [{ displayName, name, source }];
  fetchMock.get(/extensions/, extensions);
  return API.getExtensions().then(response => {
    expect(response).toEqual(transformedExtensions);
    fetchMock.restore();
  });
});

it('getExtensions null', () => {
  fetchMock.get(/extensions/, {
    body: 'null',
    headers: { 'Content-Type': 'application/json' }
  });
  return API.getExtensions().then(response => {
    expect(response).toEqual([]);
    fetchMock.restore();
  });
});
