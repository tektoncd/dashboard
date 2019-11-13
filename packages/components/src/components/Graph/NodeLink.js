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
import React, { PureComponent } from 'react';
import { path as d3Path } from 'd3-path';

// TODO: try to replace this component using vx LinkVerticalStep with stepPercent 0.5
export default class NodeLink extends PureComponent {
  render() {
    const { link } = this.props;
    const sections = link.sections[0];
    const path = d3Path();

    path.moveTo(sections.startPoint.x, sections.startPoint.y);

    if (sections.bendPoints) {
      sections.bendPoints.forEach(({ x, y }) => {
        path.lineTo(x, y);
      });
    }

    path.lineTo(sections.endPoint.x, sections.endPoint.y);

    return (
      <path strokeWidth={1} fill="none" strokeOpacity={1} d={path.toString()} />
    );
  }
}
