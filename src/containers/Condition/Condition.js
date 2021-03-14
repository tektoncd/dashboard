/*
Copyright 2020-2021 The Tekton Authors
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
import { getTitle } from '@tektoncd/dashboard-utils';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import {
  getCondition,
  getConditionsErrorMessage,
  getSelectedNamespace,
  isWebSocketConnected as selectIsWebSocketConnected
} from '../../reducers';
import { fetchCondition as fetchConditionActionCreator } from '../../actions/conditions';
import { getViewChangeHandler } from '../../utils';

function ConditionParameters({ condition, intl }) {
  if (!condition || !condition.spec.params) {
    return null;
  }

  const headers = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'default',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.default',
        defaultMessage: 'Default'
      })
    },
    {
      key: 'type',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.type',
        defaultMessage: 'Type'
      })
    }
  ];

  const rows = condition.spec.params.map(
    ({ name, default: defaultValue, type = 'string' }) => ({
      id: name,
      name,
      default: defaultValue,
      type
    })
  );

  return (
    <Table
      title={intl.formatMessage({
        id: 'dashboard.parameters.title',
        defaultMessage: 'Parameters'
      })}
      headers={headers}
      rows={rows}
    />
  );
}

export function ConditionContainer(props) {
  const {
    condition,
    error,
    fetchCondition,
    intl,
    match,
    view,
    webSocketConnected
  } = props;
  const { conditionName, namespace } = match.params;

  useEffect(() => {
    document.title = getTitle({
      page: 'Condition',
      resourceName: conditionName
    });
  }, []);

  useEffect(() => {
    fetchCondition({ name: conditionName, namespace });
  }, [conditionName, namespace, webSocketConnected]);

  return (
    <ResourceDetails
      error={error}
      kind="Condition"
      onViewChange={getViewChangeHandler(props)}
      resource={condition}
      view={view}
    >
      <ConditionParameters condition={condition} intl={intl} />
    </ResourceDetails>
  );
}

ConditionContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      conditionName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace: namespaceParam, conditionName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const namespace = namespaceParam || getSelectedNamespace(state);
  const condition = getCondition(state, {
    name: conditionName,
    namespace
  });
  return {
    error: getConditionsErrorMessage(state),
    condition,
    view,
    webSocketConnected: selectIsWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchCondition: fetchConditionActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ConditionContainer));
