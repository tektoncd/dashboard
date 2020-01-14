/*
Copyright 2019-2020 The Tekton Authors
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
import { localPoint } from '@vx/event';

const initialState = {
  dragging: false,
  scale: 1,
  translate: {
    x: 0,
    y: 0
  }
};

export default class PanZoom extends React.Component {
  state = initialState;

  reset = () => {
    this.setState(initialState);
  };

  center = () => {
    this.setState({
      translate: {
        x: 0,
        y: 0
      }
    });
  };

  zoomIn = () => {
    const { scale } = this.state;
    this.setZoom(scale * 1.25);
  };

  zoomOut = () => {
    const { scale } = this.state;
    this.setZoom(scale * 0.8);
  };

  zoomScroll = event => {
    event.preventDefault();
    if (event.deltaY > 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  };

  setZoom = scale => {
    const { maxZoom, minZoom } = this.props;
    const newScale = Math.min(Math.max(minZoom, scale), maxZoom);
    this.setState({
      scale: newScale
    });
  };

  dragStart = event => {
    this.setState({ dragging: true });
    this.startPoint = localPoint(this.props.svg(), event);
    this.startTranslate = this.state.translate;
  };

  dragEnd = () => {
    this.setState({ dragging: false });
  };

  dragMove = event => {
    if (!this.state.dragging) {
      return;
    }

    const endPoint = localPoint(this.props.svg(), event);
    const deltaX = endPoint.x - this.startPoint.x;
    const deltaY = endPoint.y - this.startPoint.y;

    this.setState(prevState => ({
      translate: {
        x: this.startTranslate.x + deltaX / prevState.scale,
        y: this.startTranslate.y + deltaY / prevState.scale
      }
    }));
  };

  render() {
    const { width, height, children } = this.props;
    const { translate, scale } = this.state;

    const center = { x: width / 2, y: height / 2 };

    const newTranslate = {
      x: translate.x * scale + center.x - center.x * scale,
      y: translate.y * scale + center.y - center.y * scale
    };

    return children({
      scale,
      translate: newTranslate,

      dragStart: this.dragStart,
      dragMove: this.dragMove,
      dragEnd: this.dragEnd,

      zoomIn: this.zoomIn,
      zoomOut: this.zoomOut,
      zoomScroll: this.zoomScroll,
      setZoom: this.setZoom,

      reset: this.reset,
      center: this.center
    });
  }
}
