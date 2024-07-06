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
/* istanbul ignore file */

import { Component } from 'react';
import { injectIntl } from 'react-intl';

import { Button } from '@carbon/react';
import {
  Cursor_1 as Cursor20,
  Move,
  ZoomIn,
  ZoomOut
} from "@carbon/react/icons";

import PanZoom from './PanZoom';
import PipelineGraph from './PipelineGraph';

const width = 300;
const height = 600;

const minZoom = 0.1;
const maxZoom = 10;

class ZoomablePipelineGraph extends Component {
  state = {
    isPanningEnabled: false
  };

  togglePanning = () => {
    const { isPanningEnabled } = this.state;
    this.setState({
      isPanningEnabled: !isPanningEnabled
    });
  };

  render() {
    const { intl } = this.props;
    const { isPanningEnabled } = this.state;
    return (
      <PanZoom
        svg={() => this.svg}
        minZoom={minZoom}
        maxZoom={maxZoom}
        width={width}
        height={height}
      >
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
              {...(isPanningEnabled
                ? {
                    onMouseDown: dragStart,
                    onMouseUp: dragEnd,
                    onMouseMove: dragMove
                  }
                : null)}
              onDoubleClick={zoomIn}
            >
              <g
                draggable
                transform={`translate(${translate.x},${translate.y}) scale(${scale},${scale})`}
              >
                <PipelineGraph {...this.props} />
              </g>
            </svg>

            <div className="toolbar">
              <Button
                disabled={!isPanningEnabled}
                iconDescription={intl.formatMessage({
                  id: 'dashboard.graph.select',
                  defaultMessage: 'Select'
                })}
                kind="ghost"
                onClick={this.togglePanning}
                renderIcon={props => <Cursor20 size={20} {...props} />}
              />
              <Button
                disabled={isPanningEnabled}
                iconDescription={intl.formatMessage({
                  id: 'dashboard.graph.pan',
                  defaultMessage: 'Pan'
                })}
                kind="ghost"
                onClick={this.togglePanning}
                renderIcon={props => <Move size={20} {...props} />}
              />
              {/* expand / collapse all */}
              {/* fit to window */}
              {/* <Button kind="ghost" renderIcon={Minimize20} /> */}
              <Button kind="ghost" onClick={reset}>
                Reset
              </Button>
              <Button kind="ghost" onClick={center}>
                Center
              </Button>
              <Button
                disabled={false}
                hasIconOnly
                iconDescription={intl.formatMessage({
                  id: 'dashboard.graph.zoomOut',
                  defaultMessage: 'Zoom out'
                })}
                kind="ghost"
                onClick={zoomOut}
                renderIcon={props => <ZoomOut size={20} {...props} />}
                tooltipPosition="top"
                tooltipAlignment="end"
              />
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                value={scale}
                step=".1"
                onChange={e => setZoom(e.target.value)}
              />
              <Button
                disabled={false}
                hasIconOnly
                iconDescription={intl.formatMessage({
                  id: 'dashboard.graph.zoomIn',
                  defaultMessage: 'Zoom in'
                })}
                kind="ghost"
                onClick={zoomIn}
                renderIcon={props => <ZoomIn size={20} {...props} />}
                tooltipPosition="top"
                tooltipAlignment="end"
              />
            </div>
          </div>
        )}
      </PanZoom>
    );
  }
}

export default injectIntl(ZoomablePipelineGraph);
