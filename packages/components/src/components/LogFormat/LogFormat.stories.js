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
  decorators: [storyFn => <div style={{ width: '500px' }}>{storyFn()}</div>],
  title: 'Experimental/Components/Log/LogFormat'
};

export const Colors = () => <LogFormat>{ansiColors}</LogFormat>;
Colors.story = {
  decorators: [
    storyFn => <div style={{ backgroundColor: '#262626' }}>{storyFn()}</div>
  ]
};

export const TextStyles = () => <LogFormat>{ansiTextStyles}</LogFormat>;
