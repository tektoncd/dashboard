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

import PanZoom from './PanZoom';
import PipelineGraph from './PipelineGraph';

import './ZoomablePipelineGraph.scss';

const width = 300;
const height = 600;

export default class ZoomablePipelineGraph extends React.Component {
  render() {
    return (
      <PanZoom svg={() => this.svg} width={width} height={height}>
        {({
          translate,
          scale,
          dragStart,
          dragMove,
          dragEnd,
          zoomIn,
          zoomOut,
          zoomScroll,
          setZoom,
          center,
          reset
        }) => (
          <div className="pipeline-graph-zoom-container">
            <svg
              width="100%"
              height="100%"
              ref={ref => {
                this.svg = ref;
              }}
              onWheel={zoomScroll}
              onMouseDown={dragStart}
              onMouseUp={dragEnd}
              onMouseMove={dragMove}
              onDoubleClick={zoomIn}
            >
              <g
                draggable
                transform={`translate(${translate.x},${
                  translate.y
                }) scale(${scale},${scale})`}
              >
                <PipelineGraph {...this.props} />
              </g>
            </svg>

            <div className="toolbar">
              {/* pan */}
              {/* expand / collapse all */}
              {/* fit to window */}
              <button type="button" onClick={reset}>
                Reset
              </button>
              <button type="button" onClick={center}>
                Center
              </button>
              <button type="button" onClick={zoomOut}>
                -
              </button>
              <input
                type="range"
                min=".1"
                max="10"
                value={scale}
                step=".1"
                onChange={e => setZoom(e.target.value)}
              />
              <button type="button" onClick={zoomIn}>
                +
              </button>
            </div>
          </div>
        )}
      </PanZoom>
    );
  }
}
