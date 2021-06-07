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

import React, { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { ResourceDetails, Trigger } from '@tektoncd/dashboard-components';
import {
  getSelectedNamespace,
  getTrigger,
  getTriggersErrorMessage,
  isFetchingTriggers,
  isWebSocketConnected as selectIsWebSocketConnected
} from '../../reducers';
import { fetchTrigger as fetchTriggerActionCreator } from '../../actions/triggers';
import { getViewChangeHandler } from '../../utils';

export function TriggerContainer(props) {
  const {
    error,
    fetchTrigger,
    loading,
    match,
    trigger,
    view,
    webSocketConnected
  } = props;
  const { triggerName, namespace } = match.params;

  useTitleSync({
    page: 'Trigger',
    resourceName: triggerName
  });

  function fetchData() {
    fetchTrigger({ name: triggerName, namespace });
  }

  useEffect(() => {
    fetchData();
  }, [triggerName, namespace]);

  useWebSocketReconnected(fetchData, webSocketConnected);

  return (
    <ResourceDetails
      error={error}
      loading={loading}
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
  const { location, match } = ownProps;
  const { namespace: namespaceParam, triggerName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const namespace = namespaceParam || getSelectedNamespace(state);
  const trigger = getTrigger(state, {
    name: triggerName,
    namespace
  });
  return {
    error: getTriggersErrorMessage(state),
    loading: isFetchingTriggers(state),
    trigger,
    view,
    webSocketConnected: selectIsWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTrigger: fetchTriggerActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TriggerContainer));
