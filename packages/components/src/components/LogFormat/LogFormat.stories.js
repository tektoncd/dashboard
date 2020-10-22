/*
Copyright 2020 The Tekton Authors
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

import React from 'react';
import LogFormat from './LogFormat';

const ansiColors = (() => {
  let text = '';
  // 16 named 'system' colors
  [30, 90, 40, 100].forEach(seq => {
    for (let i = 0; i < 8; i += 1) {
      text += `\u001b[${seq + i}m${i}  \u001b[0m`;
    }
    text += '\n';
  });
  text += '\n';
  // 256-colors
  [38, 48].forEach(seq => {
    for (let i = 0; i < 256; i += 1) {
      text += `\u001b[${seq};5;${i}m${i}  \u001b[0m`;
      if ((i + 1) % 6 === 4) {
        text += '\n';
      }
    }
    text += '\n';
  });
  return text;
})();

const ansiTextStyles = (() => {
  const textStyles = {
    bold: 1,
    italic: 3,
    underline: 4,
    conceal: 8,
    cross: 9
  };

  let text = '';
  Object.entries(textStyles).forEach(([key, value]) => {
    text += `\u001b[${value}m${key}\u001b[0m\n`;
  });
  return text;
})();

export default {
  component: LogFormat,
  title: 'Components/LogFormat'
};

export const Colors = () => <LogFormat>{ansiColors}</LogFormat>;
Colors.parameters = {
  backgrounds: {
    default: 'gray90'
  }
};

export const TextStyles = () => <LogFormat>{ansiTextStyles}</LogFormat>;

export const URLDetection = () => (
  <LogFormat>{`
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \${IMAGES[@]}))
`}</LogFormat>
);
