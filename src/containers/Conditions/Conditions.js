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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { getFilters, getTitle, urls } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchConditions as fetchConditionsActionCreator } from '../../actions/conditions';
import {
  getConditions,
  getConditionsErrorMessage,
  getSelectedNamespace,
  isFetchingConditions as selectIsFetchingConditions,
  isWebSocketConnected as selectIsWebSocketConnected
} from '../../reducers';

function Conditions(props) {
  const {
    conditions,
    error,
    fetchConditions,
    filters,
    intl,
    loading,
    namespace,
    webSocketConnected
  } = props;
  useEffect(() => {
    document.title = getTitle({ page: 'Conditions' });
  }, []);

  useEffect(() => {
    fetchConditions({ filters, namespace });
  }, [JSON.stringify(filters), namespace, webSocketConnected]);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage({
          id: 'dashboard.conditions.errorLoading',
          defaultMessage: 'Error loading Conditions'
        })
      };
    }

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
      key: 'namespace',
      header: 'Namespace'
    },
    {
      key: 'createdTime',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    }
  ];

  const conditionsFormatted = conditions.map(condition => ({
    id: condition.metadata.uid,
    name: (
      <Link
        to={urls.conditions.byName({
          namespace: condition.metadata.namespace,
          conditionName: condition.metadata.name
        })}
        title={condition.metadata.name}
      >
        {condition.metadata.name}
      </Link>
    ),
    namespace: condition.metadata.namespace,
    createdTime: (
      <FormattedDate date={condition.metadata.creationTimestamp} relative />
    )
  }));

  return (
    <ListPageLayout {...props} error={getError()} title="Conditions">
      <Table
        headers={headers}
        rows={conditionsFormatted}
        loading={loading && !conditionsFormatted.length}
        selectedNamespace={namespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'Conditions' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage:
              'No matching {kind} found in namespace {selectedNamespace}'
          },
          { kind: 'Conditions', selectedNamespace: namespace }
        )}
      />
    </ListPageLayout>
  );
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    conditions: getConditions(state, { filters, namespace }),
    error: getConditionsErrorMessage(state),
    filters,
    loading: selectIsFetchingConditions(state),
    namespace,
    webSocketConnected: selectIsWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchConditions: fetchConditionsActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Conditions));
