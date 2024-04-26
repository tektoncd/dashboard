/*
Copyright 2019-2024 The Tekton Authors
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

import FormattedDuration from './FormattedDuration';

export default {
  component: FormattedDuration,
  title: 'FormattedDuration'
};

export const OneSecond = {
  args: { milliseconds: 1000 },
  name: '1 second'
};

export const OneMinuteOneSecond = {
  args: { milliseconds: 61000 },
  name: '1 minute 1 second'
};

export const Other = {
  args: {
    milliseconds: 2 * 60 * 60 * 1000 + 1 * 60 * 1000 + 10 * 1000 // 2h 1m 10s
  }
};
