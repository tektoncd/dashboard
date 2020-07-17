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
import * as API from './triggerTemplates';

it('getTriggerTemplate', () => {
  const name = 'foo';
  const data = { fake: 'triggerTemplate' };
  fetchMock.get(`end:${name}`, data);
  return API.getTriggerTemplate({ name }).then(triggerTemplate => {
    expect(triggerTemplate).toEqual(data);
    fetchMock.restore();
  });
});

it('getTriggerTemplates', () => {
  const data = {
    items: 'triggerTemplates'
  };
  fetchMock.get(/triggertemplates/, data);
  return API.getTriggerTemplates().then(triggerTemplates => {
    expect(triggerTemplates).toEqual(data.items);
    fetchMock.restore();
  });
});
