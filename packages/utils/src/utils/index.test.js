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

import { getStatus } from '.';

it('getStatus', () => {
  const taskRun = {
    status: {
      conditions: [
        {
          type: 'Succeeded',
          foo: 'bar'
        }
      ]
    }
  };

  const status = getStatus(taskRun);
  expect(status).toMatchObject({
    foo: 'bar'
  });
});

it('getStatus with no conditions', () => {
  const taskRun = { status: {} };
  const status = getStatus(taskRun);
  expect(status).toEqual({});
});

it('getStatus with no status', () => {
  const taskRun = {};
  const status = getStatus(taskRun);
  expect(status).toEqual({});
});
