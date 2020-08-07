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

// 256 Xterm colors https://jonasjacek.github.io/colors/
const colors = [
  'rgb(0, 0, 0)',
  'rgb(128, 0, 0)',
  'rgb(0, 128, 0)',
  'rgb(128, 128, 0)',
  'rgb(0, 0, 128)',
  'rgb(128, 0, 128)',
  'rgb(0, 128, 128)',
  'rgb(192,192,192)',
  'rgb(128,128,128)',
  'rgb(255,0,0)',
  'rgb(0, 255, 0)',
  'rgb(255, 255, 0)',
  'rgb(0, 0, 255)',
  'rgb(255, 0, 255)',
  'rgb(0, 255, 255)',
  'rgb(255, 255, 255)'
];

const levels = [0, 95, 135, 175, 215, 255];
for (let r = 0; r < 6; r += 1) {
  for (let g = 0; g < 6; g += 1) {
    for (let b = 0; b < 6; b += 1) {
      const rgb = `rgb(${levels[r]}, ${levels[g]}, ${levels[b]})`;
      colors.push(rgb);
    }
  }
}

let level = 8;
for (let i = 0; i < 24; i += 1, level += 10) {
  const rgb = `rgb(${level}, ${level}, ${level})`;
  colors.push(rgb);
}

const textStyles = {
  bold: {
    fontWeight: 'bold'
  },
  italic: {
    fontStyle: 'italic'
  },
  conceal: {
    color: 'transparent'
  },
  underline: {
    textDecoration: 'underline'
  },
  cross: {
    textDecoration: 'line-through'
  }
};

export { colors, textStyles };
