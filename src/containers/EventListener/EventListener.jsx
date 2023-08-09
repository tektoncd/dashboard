/*
Copyright 2019-2023 The Tekton Authors
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
import { Link } from 'react-router-dom';
import {
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom-v5-compat';
import { useIntl } from 'react-intl';
import { urls, useTitleSync } from '@tektoncd/dashboard-utils';
import {
  Link as CustomLink,
  ResourceDetails,
  Trigger
} from '@tektoncd/dashboard-components';

import { useEventListener } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function EventListenerContainer() {
  const intl = useIntl();
  const navigate = useNavigate();
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
          <li>
            <span>
              {intl.formatMessage({
                id: 'dashboard.eventListener.serviceAccount',
                defaultMessage: 'ServiceAccount:'
              })}
            </span>
            {serviceAccountName}
          </li>
        )}
        {serviceType && (
          <li>
            <span>
              {intl.formatMessage({
                id: 'dashboard.eventListener.serviceType',
                defaultMessage: 'Service type:'
              })}
            </span>
            {serviceType}
          </li>
        )}
        {namespaceSelector?.matchNames?.length ? (
          <li>
            <span>
              {intl.formatMessage({
                id: 'dashboard.eventListener.namespaceSelector',
                defaultMessage: 'Namespace selector:'
              })}
            </span>
            {namespaceSelector.matchNames.join(', ')}
          </li>
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
      onViewChange={getViewChangeHandler({ location, navigate })}
      resource={eventListener}
      view={view}
    >
      {getTriggersContent()}
    </ResourceDetails>
  );
}

export default EventListenerContainer;
