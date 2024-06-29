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

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { urls, useTitleSync } from '@tektoncd/dashboard-utils';
import { Link, ResourceDetails, Trigger } from '@tektoncd/dashboard-components';

import { useEventListener } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function EventListenerContainer() {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { name, namespace } = params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'EventListener',
    resourceName: name
  });

  const {
    data: eventListener,
    error,
    isFetching
  } = useEventListener({
    name,
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
                  to={urls.triggers.byName({
                    name: trigger.triggerRef,
                    namespace
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
