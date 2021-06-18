/*
Copyright 2021 The Tekton Authors
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
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { ResourceDetails, Trigger } from '@tektoncd/dashboard-components';

import { isWebSocketConnected as selectIsWebSocketConnected } from '../../reducers';
import { useTrigger } from '../../api';
import { getViewChangeHandler } from '../../utils';

export function TriggerContainer(props) {
  const { match, view, webSocketConnected } = props;
  const { triggerName, namespace } = match.params;

  useTitleSync({
    page: 'Trigger',
    resourceName: triggerName
  });

  const { data: trigger, error, isFetching, refetch } = useTrigger({
    name: triggerName,
    namespace
  });

  useWebSocketReconnected(refetch, webSocketConnected);

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler(props)}
      resource={trigger}
      view={view}
    >
      {trigger?.spec && (
        <div className="tkn--resourcedetails-metadata">
          <Trigger namespace={namespace} trigger={trigger} />
        </div>
      )}
    </ResourceDetails>
  );
}

TriggerContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      triggerName: PropTypes.string.isRequired
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
    webSocketConnected: selectIsWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(TriggerContainer));
