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

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import { getTitle, useWebSocketReconnected } from '@tektoncd/dashboard-utils';
import {
  getSelectedNamespace,
  getTriggerBinding,
  getTriggerBindingsErrorMessage,
  isFetchingTriggerBindings,
  isWebSocketConnected
} from '../../reducers';
import { getViewChangeHandler } from '../../utils';

import { fetchTriggerBinding as fetchTriggerBindingActionCreator } from '../../actions/triggerBindings';

import '../../scss/Triggers.scss';

export /* istanbul ignore next */ function TriggerBindingContainer(props) {
  const {
    error,
    fetchTriggerBinding,
    intl,
    loading,
    match,
    selectedNamespace,
    triggerBinding,
    view,
    webSocketConnected
  } = props;
  const { namespace, triggerBindingName: resourceName } = match.params;

  useEffect(() => {
    document.title = getTitle({
      page: 'TriggerBinding',
      resourceName
    });
  }, []);

  function fetchData() {
    fetchTriggerBinding({ name: resourceName, namespace });
  }

  useEffect(() => {
    fetchData();
  }, [namespace, resourceName]);

  useWebSocketReconnected(fetchData, webSocketConnected);

  const headersForParameters = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'value',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.value',
        defaultMessage: 'Value'
      })
    }
  ];

  const rowsForParameters =
    triggerBinding?.spec.params.map(({ name, value }) => ({
      id: name,
      name,
      value
    })) || [];

  const emptyTextMessage = intl.formatMessage({
    id: 'dashboard.triggerBinding.noParams',
    defaultMessage: 'No parameters found for this TriggerBinding.'
  });

  return (
    <ResourceDetails
      error={error}
      loading={loading}
      onViewChange={getViewChangeHandler(props)}
      resource={triggerBinding}
      view={view}
    >
      <Table
        title={intl.formatMessage({
          id: 'dashboard.parameters.title',
          defaultMessage: 'Parameters'
        })}
        headers={headersForParameters}
        rows={rowsForParameters}
        size="short"
        selectedNamespace={selectedNamespace}
        emptyTextAllNamespaces={emptyTextMessage}
        emptyTextSelectedNamespace={emptyTextMessage}
      />
    </ResourceDetails>
  );
}

TriggerBindingContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      triggerBindingName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace: namespaceParam, triggerBindingName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const namespace = namespaceParam || getSelectedNamespace(state);
  const triggerBinding = getTriggerBinding(state, {
    name: triggerBindingName,
    namespace
  });
  return {
    error: getTriggerBindingsErrorMessage(state),
    loading: isFetchingTriggerBindings(state),
    selectedNamespace: namespace,
    triggerBinding,
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTriggerBinding: fetchTriggerBindingActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TriggerBindingContainer));
