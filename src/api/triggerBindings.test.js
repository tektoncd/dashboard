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
import * as API from './triggerBindings';

it('getTriggerBinding', () => {
  const name = 'foo';
  const data = { fake: 'triggerBinding' };
  fetchMock.get(`end:${name}`, data);
  return API.getTriggerBinding({ name }).then(triggerBinding => {
    expect(triggerBinding).toEqual(data);
    fetchMock.restore();
  });
});

it('getTriggerBindings', () => {
  const data = {
    items: 'triggerBindings'
  };
  fetchMock.get(/triggerbindings/, data);
  return API.getTriggerBindings().then(triggerBindings => {
    expect(triggerBindings).toEqual(data.items);
    fetchMock.restore();
  });
});
