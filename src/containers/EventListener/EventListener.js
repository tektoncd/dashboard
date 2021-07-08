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

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { ResourceDetails, Trigger } from '@tektoncd/dashboard-components';
import { Link as CarbonLink } from 'carbon-components-react';

import { isWebSocketConnected } from '../../reducers';
import { useEventListener } from '../../api';
import { getViewChangeHandler } from '../../utils';

export /* istanbul ignore next */ function EventListenerContainer(props) {
  const { intl, match, webSocketConnected, view } = props;
  const { eventListenerName, namespace } = match.params;

  useTitleSync({
    page: 'EventListener',
    resourceName: eventListenerName
  });

  const { data: eventListener, error, isFetching, refetch } = useEventListener({
    name: eventListenerName,
    namespace
  });

  useWebSocketReconnected(refetch, webSocketConnected);

  function getAdditionalMetadata() {
    if (!eventListener) {
      return null;
    }

    const {
      namespaceSelector,
      serviceAccountName,
      serviceType
    } = eventListener.spec;
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
                defaultMessage: 'Service type:'
              })}
            </span>
            {serviceType}
          </p>
        )}
        {namespaceSelector?.matchNames?.length ? (
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.eventListener.namespaceSelector',
                defaultMessage: 'Namespace selector:'
              })}
            </span>
            {namespaceSelector.matchNames.join(', ')}
          </p>
        ) : null}
      </>
    );
  }

  function getTriggersContent() {
    if (!eventListener?.spec?.triggers) {
      return null;
    }

    const { triggers } = eventListener.spec;

    return (
      <div className="tkn--eventlistener--triggers">
        {triggers.map((trigger, idx) => (
          <div
            className="tkn--resourcedetails-metadata"
            key={trigger.name ? trigger.name : idx}
          >
            {trigger.triggerRef ? (
              <div className="tkn--trigger-resourcelinks">
                <span>Trigger:</span>
                <Link
                  component={CarbonLink}
                  to={urls.triggers.byName({
                    namespace,
                    triggerName: trigger.triggerRef
                  })}
                  title={trigger.triggerRef}
                >
                  {trigger.triggerRef}
                </Link>
              </div>
            ) : (
              <Trigger namespace={namespace} trigger={trigger} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ResourceDetails
      additionalMetadata={getAdditionalMetadata()}
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler(props)}
      resource={eventListener}
      view={view}
    >
      {getTriggersContent()}
    </ResourceDetails>
  );
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
  const { location } = ownProps;
  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  return {
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(EventListenerContainer));
