/*
Copyright 2022-2024 The Tekton Authors
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

import { Edge as CarbonEdge } from '@carbon/charts-react';
import { path as d3Path } from 'd3-path';

export default function Edge({ direction, edge }) {
  const sections = edge.sections[0];
  const path = d3Path();

  path.moveTo(sections.startPoint.x, sections.startPoint.y);

  if (sections.bendPoints) {
    sections.bendPoints.forEach(bendPoint => {
      path.lineTo(bendPoint.x, bendPoint.y);
    });
  }

  path.lineTo(
    sections.endPoint.x - (direction === 'RIGHT' ? 3 : 0),
    sections.endPoint.y - (direction === 'RIGHT' ? 0 : 3)
  );

  return (
    <CarbonEdge
      path={path.toString()}
      markerEnd="arrowRight"
      variant="dash-sm"
    />
  );
}
