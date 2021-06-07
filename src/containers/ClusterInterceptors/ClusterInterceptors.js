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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  getFilters,
  urls,
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchClusterInterceptors as fetchClusterInterceptorsActionCreator } from '../../actions/clusterInterceptors';
import {
  getClusterInterceptors,
  getClusterInterceptorsErrorMessage,
  isFetchingClusterInterceptors as selectIsFetchingClusterInterceptors,
  isWebSocketConnected as selectIsWebSocketConnected
} from '../../reducers';

function ClusterInterceptors(props) {
  const {
    clusterInterceptors,
    error,
    fetchClusterInterceptors,
    filters,
    intl,
    loading,
    webSocketConnected
  } = props;

  useTitleSync({ page: 'ClusterInterceptors' });

  function fetchData() {
    fetchClusterInterceptors({ filters });
  }

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  useWebSocketReconnected(fetchData, webSocketConnected);

  function getError() {
    if (error) {
      return {
        error,
        title: intl.formatMessage(
          {
            id: 'dashboard.resourceList.errorLoading',
            defaultMessage: 'Error loading {type}'
          },
          { type: 'ClusterInterceptors' }
        )
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
      key: 'createdTime',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    }
  ];

  const clusterInterceptorsFormatted = clusterInterceptors.map(
    clusterInterceptor => ({
      id: clusterInterceptor.metadata.uid,
      name: (
        <Link
          to={urls.rawCRD.cluster({
            name: clusterInterceptor.metadata.name,
            type: 'clusterinterceptors'
          })}
          title={clusterInterceptor.metadata.name}
        >
          {clusterInterceptor.metadata.name}
        </Link>
      ),
      createdTime: (
        <FormattedDate
          date={clusterInterceptor.metadata.creationTimestamp}
          relative
        />
      )
    })
  );

  return (
    <ListPageLayout
      {...props}
      error={getError()}
      hideNamespacesDropdown
      title="ClusterInterceptors"
    >
      <Table
        headers={headers}
        rows={clusterInterceptorsFormatted}
        loading={loading && !clusterInterceptorsFormatted.length}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.clusterResource',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'ClusterInterceptors' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.clusterResource',
            defaultMessage: 'No matching {kind} found'
          },
          { kind: 'ClusterInterceptors' }
        )}
      />
    </ListPageLayout>
  );
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const filters = getFilters(props.location);

  return {
    clusterInterceptors: getClusterInterceptors(state, { filters }),
    error: getClusterInterceptorsErrorMessage(state),
    filters,
    loading: selectIsFetchingClusterInterceptors(state),
    webSocketConnected: selectIsWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterInterceptors: fetchClusterInterceptorsActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ClusterInterceptors));
