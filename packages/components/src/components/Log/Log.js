/*
Copyright 2019-2021 The Tekton Authors
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

import React, { Component } from 'react';
import { Button, SkeletonText } from 'carbon-components-react';
import { FixedSizeList as List } from 'react-window';
import { injectIntl } from 'react-intl';
import { getStepStatusReason, isRunning } from '@tektoncd/dashboard-utils';
import { DownToBottom16, UpToTop16 } from '@carbon/icons-react';
import {
  hasElementPositiveVerticalScrollBottom,
  hasElementPositiveVerticalScrollTop,
  isElementEndBelowViewBottom,
  isElementStartAboveViewTop
} from './domUtils';

import Ansi from '../LogFormat';

const LogLine = ({ data, index, style }) => (
  <div style={style}>
    <Ansi>{`${data[index]}\n`}</Ansi>
  </div>
);

const itemSize = 15; // This should be kept in sync with the line-height in SCSS
const defaultHeight = itemSize * 100 + itemSize / 2;

export class LogContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.logRef = React.createRef();
    this.textRef = React.createRef();
  }

  componentDidMount() {
    this.loadLog();
    if (this.props.enableLogAutoScroll || this.props.enableLogScrollButtons) {
      this.wasRunningAfterMounting();
      window.addEventListener('scroll', this.handleLogScroll, true);
      this.handleLogScroll();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (this.props.enableLogAutoScroll || this.props.enableLogScrollButtons) &&
      (prevState.logs?.length !== this.state.logs?.length ||
        prevProps.isLogsMaximized !== this.props.isLogsMaximized)
    ) {
      if (this.shouldAutoScroll()) {
        this.scrollToBottomLog();
        return;
      }
      this.handleLogScroll();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleLogScroll, true);
    clearInterval(this.timer);
    this.cancelled = true;
  }

  handleLogScroll = () => {
    if (!this.state.loading) {
      const isLogBottomUnseen = this.isLogBottomUnseen();
      const isLogTopUnseen =
        this.props.enableLogScrollButtons && this.isLogTopUnseen();
      this.updateScrollButtonCoordinates();

      if (
        isLogBottomUnseen !== this.state.isLogBottomUnseen ||
        (this.props.enableLogScrollButtons &&
          isLogTopUnseen !== this.state.isLogTopUnseen)
      ) {
        this.setState({
          isLogBottomUnseen,
          isLogTopUnseen
        });
      }
    }
  };

  shouldAutoScroll = () => {
    return (
      this.props.enableLogAutoScroll &&
      this.state.isLogBottomUnseen === false &&
      this.wasRunningAfterMounting() &&
      this.isLogBottomUnseen()
    );
  };

  isLogBottomUnseen = () => {
    return (
      isElementEndBelowViewBottom(this.logRef?.current) ||
      hasElementPositiveVerticalScrollBottom(
        this.textRef?.current?.firstElementChild
      )
    );
  };

  isLogTopUnseen = () => {
    return (
      isElementStartAboveViewTop(this.logRef?.current) ||
      hasElementPositiveVerticalScrollTop(
        this.textRef?.current?.firstElementChild
      )
    );
  };

  scrollToBottomLog = () => {
    const longTextElement = this.textRef?.current?.firstElementChild;
    if (longTextElement) {
      longTextElement.scrollTop =
        longTextElement.scrollHeight - longTextElement.clientHeight;
    }
    const rootElement = document.documentElement;
    rootElement.scrollTop = rootElement.scrollHeight - rootElement.clientHeight;
  };

  scrollToTopLog = () => {
    const longTextElement = this.textRef?.current?.firstElementChild;
    if (longTextElement) {
      longTextElement.scrollTop = 0;
    }
    document.documentElement.scrollTop = 0;
  };

  wasRunningAfterMounting = () => {
    if (this.alreadyWasRunningAfterMounting) {
      return true;
    }
    const { reason, status } = getStepStatusReason(this.props.stepStatus);
    if (isRunning(reason, status)) {
      // alreadyWasRunningAfterMounting is a class variable instead of state variable because a change in its value does not require a subsequent re-rendering
      this.alreadyWasRunningAfterMounting = true;
      return true;
    }
    return false;
  };

  updateScrollButtonCoordinates = () => {
    if (this.props.enableLogScrollButtons) {
      const logRectangle = this.logRef.current?.getBoundingClientRect();
      const logElementRight =
        document.documentElement?.clientWidth - logRectangle.right;

      const scrollButtonTop = Math.max(0, logRectangle.top);

      const scrollButtonBottom = Math.max(
        0,
        document.documentElement?.clientHeight - logRectangle.bottom
      );

      this.updateCssStyleProperty(logElementRight, '--tkn-log-element-right');
      this.updateCssStyleProperty(scrollButtonTop, '--tkn-scroll-button-top');
      this.updateCssStyleProperty(
        scrollButtonBottom,
        '--tkn-scroll-button-bottom'
      );
    }
  };

  updateCssStyleProperty = (computedVariable, variableName) => {
    // instead of using a state variable + inline styling for the button vertical position,
    // a class variable + css custom property are used (avoiding unnecessary re-rendering of entire component)
    if (
      !Number.isNaN(computedVariable) &&
      this[variableName] !== computedVariable
    ) {
      this[variableName] = computedVariable;
      document.documentElement?.style.setProperty(
        variableName,
        `${computedVariable.toString()}px`
      );
    }
  };

  getScrollButtons = () => {
    const { enableLogScrollButtons, intl } = this.props;
    const { isLogBottomUnseen, isLogTopUnseen, loading } = this.state;

    if (!enableLogScrollButtons || loading) {
      return null;
    }
    const scrollButtonTopMessage = intl.formatMessage({
      id: 'dashboard.logs.scrollToTop',
      defaultMessage: 'Scroll to start of logs'
    });
    const scrollButtonBottomMessage = intl.formatMessage({
      id: 'dashboard.logs.scrollToBottom',
      defaultMessage: 'Scroll to end of logs'
    });

    return (
      <div className="button-container">
        {isLogTopUnseen ? (
          <Button
            className="bx--copy-btn"
            hasIconOnly
            iconDescription={scrollButtonTopMessage}
            id="log-scroll-to-top-btn"
            onClick={this.scrollToTopLog}
            renderIcon={() => (
              <UpToTop16>
                <title>{scrollButtonTopMessage}</title>
              </UpToTop16>
            )}
            size="sm"
            tooltipPosition="right"
          />
        ) : null}
        {isLogBottomUnseen ? (
          <Button
            className="bx--copy-btn"
            iconDescription={scrollButtonBottomMessage}
            hasIconOnly
            id="log-scroll-to-bottom-btn"
            onClick={this.scrollToBottomLog}
            renderIcon={() => (
              <DownToBottom16>
                <title>{scrollButtonBottomMessage}</title>
              </DownToBottom16>
            )}
            size="sm"
            tooltipPosition="right"
          />
        ) : null}
      </div>
    );
  };

  getLogList = () => {
    const { stepStatus, intl } = this.props;
    const { reason } = (stepStatus && stepStatus.terminated) || {};
    const {
      logs = [
        intl.formatMessage({
          id: 'dashboard.pipelineRun.logEmpty',
          defaultMessage: 'No log available'
        })
      ]
    } = this.state;

    if (logs.length < 20000) {
      return <Ansi>{logs.join('\n')}</Ansi>;
    }

    const height = reason
      ? Math.min(defaultHeight, itemSize * logs.length)
      : defaultHeight;

    return (
      <List
        height={height}
        itemCount={logs.length}
        itemData={logs}
        itemSize={itemSize}
        width="100%"
      >
        {LogLine}
      </List>
    );
  };

  getTrailerMessage = trailer => {
    const { forcePolling, intl } = this.props;

    if (trailer && forcePolling) {
      return intl.formatMessage({
        id: 'dashboard.logs.pending',
        defaultMessage: 'Final logs pending'
      });
    }

    switch (trailer) {
      case 'Completed':
        return intl.formatMessage({
          id: 'dashboard.pipelineRun.stepCompleted',
          defaultMessage: 'Step completed'
        });
      case 'Error':
        return intl.formatMessage({
          id: 'dashboard.pipelineRun.stepFailed',
          defaultMessage: 'Step failed'
        });
      default:
        return null;
    }
  };

  readChunks = ({ done, value }, decoder, text = '') => {
    if (this.cancelled) {
      this.reader.cancel();
      return undefined;
    }
    let logs = text;
    if (value) {
      logs += decoder.decode(value, { stream: !done });
      this.setState({
        loading: false,
        logs: logs.split('\n')
      });
    } else {
      this.setState({
        loading: false
      });
    }
    if (done) {
      return undefined;
    }
    return this.reader
      .read()
      .then(result => this.readChunks(result, decoder, logs))
      .catch(error => {
        console.error(error); // eslint-disable-line no-console
        return this.loadLog();
      });
  };

  loadLog = async () => {
    const {
      fetchLogs,
      forcePolling,
      intl,
      stepStatus,
      pollingInterval
    } = this.props;
    if (!fetchLogs) {
      return;
    }

    let continuePolling = false;
    try {
      continuePolling = forcePolling || (stepStatus && !stepStatus.terminated);
      const logs = await fetchLogs();
      if (logs?.getReader) {
        // logs is a https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
        const decoder = new TextDecoder();
        this.reader = logs.getReader();
        await this.reader
          .read()
          .then(result => this.readChunks(result, decoder))
          .catch(error => {
            throw error;
          });
      } else {
        this.setState({
          loading: false,
          logs: logs ? logs.split('\n') : undefined
        });
        if (continuePolling) {
          this.timer = setTimeout(this.loadLog, pollingInterval);
        }
      }
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      this.setState({
        loading: false,
        logs: [
          intl.formatMessage({
            id: 'dashboard.pipelineRun.logFailed',
            defaultMessage: 'Unable to fetch log'
          })
        ]
      });
      if (continuePolling) {
        this.timer = setTimeout(this.loadLog, pollingInterval);
      }
    }
  };

  logTrailer = () => {
    const { forcePolling, stepStatus } = this.props;
    const { reason } = (stepStatus && stepStatus.terminated) || {};
    const trailer = this.getTrailerMessage(reason);
    if (!trailer) {
      return null;
    }

    return (
      <div
        className="tkn--log-trailer"
        data-status={reason && (forcePolling ? 'LogsPending' : reason)}
      >
        {trailer}
      </div>
    );
  };

  render() {
    const { toolbar } = this.props;
    const { loading } = this.state;
    return (
      <pre className="tkn--log" ref={this.logRef}>
        {loading ? (
          <SkeletonText paragraph width="60%" />
        ) : (
          <>
            {toolbar}
            <div className="tkn--log-container" ref={this.textRef}>
              {this.getLogList()}
            </div>
            {this.logTrailer()}
            {this.getScrollButtons()}
          </>
        )}
      </pre>
    );
  }
}

LogContainer.defaultProps = {
  pollingInterval: 4000
};

export default injectIntl(LogContainer);
