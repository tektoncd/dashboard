/*
Copyright 2020 The Tekton Authors
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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import {
  getErrorMessage,
  getFilters,
  getStatus,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import {
  FormattedDate,
  FormattedDuration,
  StatusIcon,
  Table
} from '@tektoncd/dashboard-components';
import { InlineNotification } from 'carbon-components-react';

import { LabelFilter } from '..';
import { fetchBuilds } from '../../actions/builds';
import {
  getBuilds,
  getBuildsErrorMessage,
  getSelectedNamespace,
  isFetchingBuilds,
  isWebSocketConnected
} from '../../reducers';

export class Builds extends Component {
  componentDidMount() {
    document.title = getTitle({ page: 'Builds' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchBuilds({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      builds,
      loading,
      intl,
      namespace: selectedNamespace
    } = this.props;

    const headers = [
      {
        key: 'status',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.status',
          defaultMessage: 'Status'
        })
      },
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
        key: 'url',
        header: 'Repository'
      },
      {
        key: 'revision',
        header: 'Revision'
      },
      {
        key: 'serviceAccount',
        header: 'Service account'
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'duration',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.duration',
          defaultMessage: 'Duration'
        })
      }
    ];

    const getParam = (spec, key) => {
      const param = spec.params.find(x => x.name === key);
      if (param) {
        return param.value;
      }
      return undefined;
    };

    const buildsFormatted = builds.map(build => {
      const { lastTransitionTime, reason, status } = getStatus({
        status: build.status.pipelineRun
      });
      let endTime = Date.now();
      if (status === 'False' || status === 'True') {
        endTime = new Date(lastTransitionTime).getTime();
      }
      return {
        id: build.metadata.uid,
        name: (
          <Link
            to={urls.builds.byName({
              namespace: build.metadata.namespace,
              buildName: build.metadata.name
            })}
            title={build.metadata.name}
          >
            {build.metadata.name}
          </Link>
        ),
        namespace: build.metadata.namespace,
        url: getParam(build.spec.pipelineResourceSpec, 'url'),
        revision: getParam(build.spec.pipelineResourceSpec, 'revision'),
        serviceAccount: build.spec.serviceAccountName,
        createdTime: (
          <FormattedDate date={build.metadata.creationTimestamp} relative />
        ),
        duration: (
          <FormattedDuration
            milliseconds={
              endTime - new Date(build.metadata.creationTimestamp).getTime()
            }
          />
        ),
        status: (
          <div className="tkn--definition">
            <div
              className="tkn--status"
              data-status={status}
              data-reason={reason}
            >
              <StatusIcon reason={reason} status={status} />
            </div>
          </div>
        )
      };
    });

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.conditions.errorLoading',
            defaultMessage: 'Error loading Builds'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <>
        <h1>Builds</h1>
        <LabelFilter {...this.props} />
        <Table
          headers={headers}
          rows={buildsFormatted}
          loading={loading && !buildsFormatted.length}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} in any namespace.'
            },
            { kind: 'Builds' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} in namespace {selectedNamespace}'
            },
            { kind: 'Builds', selectedNamespace }
          )}
        />
      </>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getBuildsErrorMessage(state),
    filters,
    builds: getBuilds(state, { filters, namespace }),
    loading: isFetchingBuilds(state),
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchBuilds
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Builds));
