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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { getTitle } from '@tektoncd/dashboard-utils';
import { ResourceDetails, Trigger } from '@tektoncd/dashboard-components';
import {
  getEventListener,
  getEventListenersErrorMessage,
  getSelectedNamespace,
  isFetchingEventListeners,
  isWebSocketConnected
} from '../../reducers';
import { fetchEventListener } from '../../actions/eventListeners';
import { getViewChangeHandler } from '../../utils';

import './EventListener.scss';

export /* istanbul ignore next */ class EventListenerContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { eventListenerName: resourceName } = match.params;
    document.title = getTitle({
      page: 'EventListener',
      resourceName
    });
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

  getAdditionalMetadata() {
    const { eventListener, intl } = this.props;

    if (!eventListener) {
      return null;
    }

    const { serviceAccountName, serviceType } = eventListener.spec;
    return (
      <>
        {serviceAccountName && (
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.eventListener.serviceAccount',
                defaultMessage: 'ServiceAccount:'
              })}
            </span>
            {serviceAccountName}
          </p>
        )}
        {serviceType && (
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.eventListener.serviceType',
                defaultMessage: 'Service Type:'
              })}
            </span>
            {serviceType}
          </p>
        )}
      </>
    );
  }

  getTriggersContent() {
    const { eventListener } = this.props;

    if (!eventListener) {
      return null;
    }

    const { triggers } = eventListener.spec;
    const { namespace } = eventListener.metadata;

    return (
      <div className="tkn--eventlistener--triggers">
        {triggers.map((trigger, idx) => (
          <div
            className="tkn--resourcedetails-metadata"
            key={trigger.name ? trigger.name : idx}
          >
            <Trigger eventListenerNamespace={namespace} trigger={trigger} />
          </div>
        ))}
      </div>
    );
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, eventListenerName } = match.params;
    this.props.fetchEventListener({ name: eventListenerName, namespace });
  }

  render() {
    const { error, eventListener, loading, view } = this.props;

    return (
      <ResourceDetails
        additionalMetadata={this.getAdditionalMetadata()}
        error={error}
        loading={loading}
        onViewChange={getViewChangeHandler(this.props)}
        resource={eventListener}
        view={view}
      >
        {this.getTriggersContent()}
      </ResourceDetails>
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
  const { location, match } = ownProps;
  const { namespace: namespaceParam, eventListenerName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const namespace = namespaceParam || getSelectedNamespace(state);
  const eventListener = getEventListener(state, {
    name: eventListenerName,
    namespace
  });
  return {
    error: getEventListenersErrorMessage(state),
    eventListener,
    loading: isFetchingEventListeners(state),
    view,
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
