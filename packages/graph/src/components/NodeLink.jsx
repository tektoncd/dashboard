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
/* istanbul ignore file */
import React from 'react';
import { path as d3Path } from 'd3-path';

const NodeLink = ({ link }) => {
  const sections = link.sections[0];
  const path = d3Path();

  const { x: startX, y: startY } = sections.startPoint;
  const { x: targetX, y: targetY } = sections.endPoint;

  const percent = 0.5;
  path.moveTo(startX, startY);
  path.lineTo(startX, startY + (targetY - startY) * percent);
  path.lineTo(targetX, startY + (targetY - startY) * percent);
  path.lineTo(targetX, targetY - 1); // stop short to prevent it showing around the arrow tip

  return (
    <path strokeWidth={1} fill="none" strokeOpacity={1} d={path.toString()} />
  );
};

export default NodeLink;
