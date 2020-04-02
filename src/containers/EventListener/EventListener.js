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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { InlineNotification, Tag } from 'carbon-components-react';
import { formatLabels } from '@tektoncd/dashboard-utils';
import { FormattedDate, Trigger } from '@tektoncd/dashboard-components';
import {
  getEventListener,
  getEventListenersErrorMessage,
  getSelectedNamespace,
  isWebSocketConnected
} from '../../reducers';
import { fetchEventListener } from '../../actions/eventListeners';

import './EventListener.scss';

export /* istanbul ignore next */ class EventListenerContainer extends Component {
  static notification({ kind, message, intl }) {
    const titles = {
      info: intl.formatMessage({
        id: 'dashboard.eventListener.unavailable',
        defaultMessage: 'EventListener not available'
      }),
      error: intl.formatMessage({
        id: 'dashboard.eventListener.errorloading',
        defaultMessage: 'Error loading EventListener'
      })
    };
    return (
      <InlineNotification
        kind={kind}
        hideCloseButton
        lowContrast
        title={titles[kind]}
        subtitle={message}
      />
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, eventListenerName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      eventListenerName: prevEventListenerName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      eventListenerName !== prevEventListenerName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, eventListenerName } = match.params;
    this.props.fetchEventListener({ name: eventListenerName, namespace });
  }

  render() {
    const { intl, error, match, eventListener } = this.props;

    if (error) {
      return EventListenerContainer.notification({
        kind: 'error',
        intl
      });
    }
    if (!eventListener) {
      return EventListenerContainer.notification({
        kind: 'error',
        message: intl.formatMessage({
          id: 'dashboard.eventListener.unavailable',
          defaultMessage: 'EventListener not available'
        }),
        intl
      });
    }

    const { triggers } = eventListener.spec;
    const { eventListenerName } = match.params;
    const eventListenerNamespace = eventListener.metadata.namespace;

    let formattedLabelsToRender = [];
    if (eventListener.metadata.labels) {
      formattedLabelsToRender = formatLabels(eventListener.metadata.labels);
    }

    return (
      <div className="trigger">
        <h1>{eventListenerName}</h1>
        <div className="details">
          <div className="resource--detail-block">
            <p>
              <span>
                {intl.formatMessage({
                  id: 'dashboard.metadata.dateCreated',
                  defaultMessage: 'Date Created:'
                })}
              </span>
              <FormattedDate
                date={eventListener.metadata.creationTimestamp}
                relative
              />
            </p>
            <p>
              <span>
                {intl.formatMessage({
                  id: 'dashboard.metadata.labels',
                  defaultMessage: 'Labels:'
                })}
              </span>
              {formattedLabelsToRender.length === 0
                ? intl.formatMessage({
                    id: 'dashboard.metadata.none',
                    defaultMessage: 'None'
                  })
                : formattedLabelsToRender.map(label => (
                    <Tag type="blue" key={label}>
                      {label}
                    </Tag>
                  ))}
            </p>
            <p>
              <span>
                {intl.formatMessage({
                  id: 'dashboard.metadata.namespace',
                  defaultMessage: 'Namespace:'
                })}
              </span>
              {eventListener.metadata.namespace}
            </p>
            {eventListener.spec.serviceAccountName && (
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.eventListener.serviceAccount',
                    defaultMessage: 'ServiceAccount:'
                  })}
                </span>
                {eventListener.spec.serviceAccountName}
              </p>
            )}
            {eventListener.spec.serviceType && (
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.eventListener.serviceType',
                    defaultMessage: 'Service Type:'
                  })}
                </span>
                {eventListener.spec.serviceType}
              </p>
            )}
          </div>
          <div className="eventlistener--triggers">
            {triggers.map((trigger, idx) => (
              <div
                className="resource--detail-block"
                key={trigger.name ? trigger.name : idx}
              >
                <Trigger
                  eventListenerNamespace={eventListenerNamespace}
                  trigger={trigger}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

EventListenerContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      eventListenerName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace: namespaceParam, eventListenerName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);
  const eventListener = getEventListener(state, {
    name: eventListenerName,
    namespace
  });
  return {
    error: getEventListenersErrorMessage(state),
    eventListener,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchEventListener
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(EventListenerContainer));
