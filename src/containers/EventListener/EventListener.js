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
/* istanbul ignore file */

import React from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { urls, useTitleSync } from '@tektoncd/dashboard-utils';
import {
  Link as CustomLink,
  ResourceDetails,
  Trigger
} from '@tektoncd/dashboard-components';

import { useEventListener } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function EventListenerContainer({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const { eventListenerName, namespace } = params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'EventListener',
    resourceName: eventListenerName
  });

  const {
    data: eventListener,
    error,
    isFetching
  } = useEventListener({
    name: eventListenerName,
    namespace
  });

  function getAdditionalMetadata() {
    if (!eventListener) {
      return null;
    }

    const { namespaceSelector, serviceAccountName, serviceType } =
      eventListener.spec;
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
                  component={CustomLink}
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
      onViewChange={getViewChangeHandler({ history, location })}
      resource={eventListener}
      view={view}
    >
      {getTriggersContent()}
    </ResourceDetails>
  );
}

export default injectIntl(EventListenerContainer);
