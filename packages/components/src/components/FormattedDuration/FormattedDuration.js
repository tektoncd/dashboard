/*
Copyright 2019-2022 The Tekton Authors
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
import { defineMessages, injectIntl } from 'react-intl';
import FormattedDuration from 'react-intl-formatted-duration';

defineMessages({
  duration: {
    id: 'react-intl-formatted-duration.duration',
    defaultMessage: '{value} {unit}'
  },
  daysUnit: {
    id: 'react-intl-formatted-duration.daysUnit',
    defaultMessage: '{value, plural, one {day} other {days}}'
  },
  hoursUnit: {
    id: 'react-intl-formatted-duration.hoursUnit',
    defaultMessage: '{value, plural, one {hour} other {hours}}'
  },
  minutesUnit: {
    id: 'react-intl-formatted-duration.minutesUnit',
    defaultMessage: '{value, plural, one {minute} other {minutes}}'
  },
  secondsUnit: {
    id: 'react-intl-formatted-duration.secondsUnit',
    defaultMessage: '{value, plural, one {second} other {seconds}}'
  }
});

class FormattedDurationWrapper extends Component {
  state = { tooltip: '' };

  componentDidMount() {
    const { intl } = this.props;
    const tooltip = intl.formatMessage(
      {
        id: 'dashboard.run.duration',
        defaultMessage: 'Duration: {duration}'
      },
      {
        duration: this.durationNode?.textContent
      }
    );
    this.setState({
      tooltip
    });
  }

  componentDidUpdate() {
    const { intl } = this.props;
    const duration = this.durationNode.textContent;
    const tooltip = intl.formatMessage(
      {
        id: 'dashboard.run.duration',
        defaultMessage: 'Duration: {duration}'
      },
      {
        duration
      }
    );
    if (this.state.tooltip !== tooltip) {
      this.setState({ // eslint-disable-line
        tooltip
      });
    }
  }

  render() {
    const { milliseconds } = this.props;
    return (
      <span
        ref={ref => {
          this.durationNode = ref;
        }}
        title={this.state.tooltip}
      >
        <FormattedDuration
          format="{days} {hours} {minutes} {seconds}"
          seconds={milliseconds / 1000}
          unitDisplay="narrow"
        />
      </span>
    );
  }
}

export default injectIntl(FormattedDurationWrapper);
