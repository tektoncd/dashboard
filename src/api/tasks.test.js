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

import fetchMock from 'fetch-mock';
import * as API from './tasks';
import * as utils from './utils';

it('getTasks', () => {
  const data = {
    items: 'tasks'
  };
  fetchMock.get(/tasks/, data);
  return API.getTasks().then(tasks => {
    expect(tasks).toEqual(data.items);
    fetchMock.restore();
  });
});

it('getTask', () => {
  const name = 'foo';
  const data = { fake: 'task' };
  fetchMock.get(`end:${name}`, data);
  return API.getTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('deleteTask', () => {
  const name = 'foo';
  const data = { fake: 'task' };
  fetchMock.delete(`end:${name}`, data);
  return API.deleteTask({ name }).then(task => {
    expect(task).toEqual(data);
    fetchMock.restore();
  });
});

it('useTasks', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useCollection').mockImplementation(() => query);
  expect(API.useTasks(params)).toEqual(query);
  expect(utils.useCollection).toHaveBeenCalledWith(
    'Task',
    API.getTasks,
    params
  );
});

it('useTask', () => {
  const query = { fake: 'query' };
  const params = { fake: 'params' };
  jest.spyOn(utils, 'useResource').mockImplementation(() => query);
  expect(API.useTask(params)).toEqual(query);
  expect(utils.useResource).toHaveBeenCalledWith(
    'Task',
    API.getTask,
    params,
    undefined
  );

  const queryConfig = { fake: 'queryConfig' };
  API.useTask(params, queryConfig);
  expect(utils.useResource).toHaveBeenCalledWith(
    'Task',
    API.getTask,
    params,
    queryConfig
  );
});
