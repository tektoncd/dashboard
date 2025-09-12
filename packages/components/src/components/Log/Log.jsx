/*
Copyright 2019-2025 The Tekton Authors
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

import { Component, createRef } from 'react';
import { Button, PrefixContext, SkeletonText } from '@carbon/react';
import { List } from 'react-window';
import { injectIntl, useIntl } from 'react-intl';
import { getStepStatusReason, isRunning } from '@tektoncd/dashboard-utils';
import { DownToBottom, Information, UpToTop } from '@carbon/react/icons';

import {
  hasElementPositiveVerticalScrollBottom,
  hasElementPositiveVerticalScrollTop,
  isElementEndBelowViewBottom,
  isElementStartAboveViewTop
} from './domUtils';
import DotSpinner from '../DotSpinner';
import LogFormat from '../LogFormat';

const itemSize = 16; // This should be kept in sync with the line-height in SCSS
const defaultHeight = itemSize * 100 + itemSize / 2;

export const logFormatRegex =
  /^((?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(.\d{3,9})?(Z|[+-]\d{2}:\d{2}))\s?)?(::(?<command>group|endgroup|error|warning|info|notice|debug)::)?(?<message>.*)?$/s;

function LogsFilteredNotification({ displayedLogLines, totalLogLines }) {
  const intl = useIntl();

  if (displayedLogLines === totalLogLines) {
    return null;
  }

  if (displayedLogLines === 0) {
    return (
      <span className="tkn--log-filtered">
        <Information />
        {intl.formatMessage({
          id: 'dashboard.logs.hidden.all',
          defaultMessage:
            'All lines hidden due to selected log levels or collapsed groups'
        })}
      </span>
    );
  }

  const hiddenLines = totalLogLines - displayedLogLines;
  const message =
    hiddenLines === 1
      ? intl.formatMessage(
          {
            id: 'dashboard.logs.hidden.one',
            defaultMessage:
              '1 line hidden due to selected log levels or collapsed groups'
          },
          { numHiddenLines: totalLogLines - displayedLogLines }
        )
      : intl.formatMessage(
          {
            id: 'dashboard.logs.hidden',
            defaultMessage:
              '{numHiddenLines, plural, other {# lines}} hidden due to selected log levels or collapsed groups'
          },
          { numHiddenLines: totalLogLines - displayedLogLines }
        );

  return (
    <span className="tkn--log-filtered">
      <Information />
      {message}
    </span>
  );
}

export class LogContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { groupsExpanded: {}, loading: true, logs: [] };
    this.logRef = createRef();
    this.textRef = createRef();
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
    clearTimeout(this.timer);
    this.cancelled = true;
  }

  onToggleGroup = ({ expanded, groupIndex }) => {
    this.setState(({ groupsExpanded }) => ({
      groupsExpanded: {
        ...groupsExpanded,
        [groupIndex]: expanded
      }
    }));
  };

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
        document.documentElement.clientWidth - logRectangle.right;

      const scrollButtonTop = Math.max(0, logRectangle.top);

      const scrollButtonBottom = Math.max(
        0,
        document.documentElement.clientHeight - logRectangle.bottom
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
      document.documentElement.style.setProperty(
        variableName,
        `${computedVariable.toString()}px`
      );
    }
  };

  getScrollButtons = () => {
    const carbonPrefix = this.context;
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
            autoAlign
            className={`${carbonPrefix}--copy-btn`}
            hasIconOnly
            iconDescription={scrollButtonTopMessage}
            id="log-scroll-to-start-btn"
            onClick={this.scrollToTopLog}
            renderIcon={UpToTop}
            size="sm"
            tooltipAlignment="end"
            tooltipPosition="left"
          />
        ) : null}
        {isLogBottomUnseen ? (
          <Button
            autoAlign
            className={`${carbonPrefix}--copy-btn`}
            iconDescription={scrollButtonBottomMessage}
            hasIconOnly
            id="log-scroll-to-end-btn"
            onClick={this.scrollToBottomLog}
            renderIcon={DownToBottom}
            size="sm"
            tooltipAlignment="end"
            tooltipPosition="left"
          />
        ) : null}
      </div>
    );
  };

  getLogList = () => {
    const {
      intl,
      logLevels,
      parseLogLine = line => {
        if (!line?.length) {
          return { message: line };
        }

        const {
          groups: { command, message, timestamp }
        } = logFormatRegex.exec(line);
        let level;
        if (!['group', 'endgroup'].includes(command)) {
          level = command;
        }
        return {
          command,
          level,
          message,
          timestamp
        };
      },
      showLevels,
      showTimestamps,
      stepStatus
    } = this.props;
    const { reason } = (stepStatus && stepStatus.terminated) || {};
    const {
      groupsExpanded,
      logs = [
        intl.formatMessage({
          id: 'dashboard.pipelineRun.logEmpty',
          defaultMessage: 'No log available'
        })
      ]
    } = this.state;

    let previousTimestamp;
    let currentGroupIndex = null;
    let countEndGroupCommands = 0;
    const parsedLogs = logs.reduce((acc, line, index) => {
      const parsedLogLine = parseLogLine(line);
      if (!parsedLogLine.timestamp) {
        // multiline log, use same timestamp as previous line
        parsedLogLine.timestamp = previousTimestamp;
      } else {
        previousTimestamp = parsedLogLine.timestamp;
      }

      const isGroup = parsedLogLine.command === 'group';
      const isEndGroup = parsedLogLine.command === 'endgroup';
      if (isGroup) {
        currentGroupIndex = index;
        parsedLogLine.groupIndex = index;
        if (groupsExpanded[index] !== false) {
          // if not already explicitly collapsed,
          // respect state if explicitly expanded, otherwise
          // should be expanded by default if viewed when step running
          // or collapsed by default if viewing after run complete
          parsedLogLine.expanded =
            groupsExpanded[index] || this.wasRunningAfterMounting();
        }
      } else if (isEndGroup) {
        currentGroupIndex = null;
        countEndGroupCommands++; // eslint-disable-line no-plusplus
        // we don't render anything for the endgroup command
        return acc;
      }

      if (!isGroup && currentGroupIndex !== null) {
        // we're inside a group, determine if the line should be rendered
        if (
          groupsExpanded[currentGroupIndex] === false ||
          (!groupsExpanded[currentGroupIndex] &&
            !this.wasRunningAfterMounting())
        ) {
          // skip if either explicitly collapsed, or viewed after step completed so collapsed by default
          return acc;
        }

        parsedLogLine.groupIndex = currentGroupIndex;
      }

      if (
        !logLevels ||
        // we treat lines with no log level as if they specified 'info'
        // but we don't display a default level for these lines to avoid
        // unnecessary noise for users not using the expected log format
        (!parsedLogLine.level && logLevels.info) ||
        logLevels[parsedLogLine.level]
      ) {
        acc.push(parsedLogLine);
      }
      return acc;
    }, []);

    // need to include endgroup commands in count of displayed log lines
    // otherwise we end up with wrong message about hidden lines displayed to
    // user even when all groups are expanded
    const displayedLogLines = parsedLogs.length + countEndGroupCommands;
    if (parsedLogs.length < 20_000) {
      return (
        <>
          <LogsFilteredNotification
            displayedLogLines={displayedLogLines}
            totalLogLines={logs.length}
          />
          <LogFormat
            fields={{ level: showLevels, timestamp: showTimestamps }}
            logs={parsedLogs}
            onToggleGroup={this.onToggleGroup}
          />
        </>
      );
    }

    const height = reason
      ? Math.min(defaultHeight, itemSize * logs.length)
      : defaultHeight;

    return (
      <>
        <LogsFilteredNotification
          displayedLogLines={displayedLogLines}
          totalLogLines={logs.length}
        />
        <List
          rowComponent={({ data, index, style }) => (
            <LogFormat
              fields={{ level: showLevels, timestamp: showTimestamps }}
              logs={[data[index]]}
              onToggleGroup={this.onToggleGroup}
              style={style}
            />
          )}
          rowCount={parsedLogs.length}
          rowProps={{ data: parsedLogs }}
          rowHeight={itemSize}
          style={{ height }}
        />
      </>
    );
  };

  getTrailerMessage = ({ exitCode, reason, terminationReason }) => {
    const { forcePolling, intl, isSidecar } = this.props;

    if (isSidecar) {
      return null;
    }

    if (terminationReason === 'Skipped') {
      return intl.formatMessage({
        id: 'dashboard.pipelineRun.stepSkipped',
        defaultMessage: 'Step skipped'
      });
    }

    if (reason && forcePolling) {
      return (
        <>
          {intl.formatMessage({
            id: 'dashboard.logs.pending',
            defaultMessage: 'Final logs pending'
          })}
          <DotSpinner />
        </>
      );
    }

    switch (reason) {
      case 'Completed':
        if (exitCode !== 0) {
          return intl.formatMessage(
            {
              id: 'dashboard.pipelineRun.stepCompleted.exitCode',
              defaultMessage: 'Step completed with exit code {exitCode}'
            },
            { exitCode }
          );
        }
        return intl.formatMessage({
          id: 'dashboard.pipelineRun.stepCompleted',
          defaultMessage: 'Step completed successfully'
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
        logs: logs.split(/\r?\n/)
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
    const { fetchLogs, forcePolling, intl, stepStatus, pollingInterval } =
      this.props;
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
          logs: logs ? logs.split(/\r?\n/) : undefined
        });
        if (continuePolling) {
          clearTimeout(this.timer);
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
        clearTimeout(this.timer);
        this.timer = setTimeout(this.loadLog, pollingInterval);
      }
    }
  };

  logTrailer = () => {
    const { forcePolling, stepStatus } = this.props;
    const { exitCode, reason } = (stepStatus && stepStatus.terminated) || {};
    const trailer = this.getTrailerMessage({
      exitCode,
      reason,
      terminationReason: stepStatus?.terminationReason
    });
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
      <pre className="tkn--log tkn--theme-dark" ref={this.logRef}>
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
LogContainer.contextType = PrefixContext;
LogContainer.defaultProps = {
  pollingInterval: 4000
};

export default injectIntl(LogContainer);
