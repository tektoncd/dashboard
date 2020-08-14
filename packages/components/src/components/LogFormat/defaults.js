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

// 256-color lookup table

// the first 16 colors are the same as the 'system' colors 30-37 and 90-97
const colors = [
  'rgb(0, 0, 0)', // black
  'rgb(187, 0, 0)', // red
  'rgb(0, 187, 0)', // green
  'rgb(187, 187, 0)', // yellow
  'rgb(0, 0, 187)', // blue
  'rgb(187, 0, 187)', // magenta
  'rgb(0, 187, 187)', // cyan
  'rgb(187, 187, 187)', // white

  'rgb(85, 85, 85)', // light-black
  'rgb(255, 85, 85)', // light-red
  'rgb(0, 255, 0)', // light-green
  'rgb(255, 255, 85)', // light-yellow
  'rgb(85, 85, 255)', // light-blue
  'rgb(255, 85, 255)', // light-magenta
  'rgb(85, 255, 255)', // light-cyan
  'rgb(255, 255, 255)' // light-white
];

// 216 colors (6*6*6 cube)
const levels = [0, 95, 135, 175, 215, 255];
for (let r = 0; r < 6; r += 1) {
  for (let g = 0; g < 6; g += 1) {
    for (let b = 0; b < 6; b += 1) {
      const rgb = `rgb(${levels[r]}, ${levels[g]}, ${levels[b]})`;
      colors.push(rgb);
    }
  }
}

// grayscale
let level = 8;
for (let i = 0; i < 24; i += 1, level += 10) {
  const rgb = `rgb(${level}, ${level}, ${level})`;
  colors.push(rgb);
}

export { colors };
