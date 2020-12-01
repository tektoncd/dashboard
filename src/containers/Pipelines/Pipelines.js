/*
Copyright 2019-2020 The Tekton Authors
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
import { Information16 } from '@carbon/icons-react';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { InlineNotification } from 'carbon-components-react';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { ListPageLayout } from '..';
import { fetchPipelines } from '../../actions/pipelines';
import {
  getPipelines,
  getPipelinesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelines,
  isWebSocketConnected
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class Pipelines extends Component {
  componentDidMount() {
    document.title = getTitle({ page: 'Pipelines' });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    if (
      namespace !== prevProps.namespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchPipelines({ filters, namespace });
  }

  render() {
    const {
      error,
      loading,
      pipelines,
      intl,
      namespace: selectedNamespace
    } = this.props;

    const initialHeaders = [
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
      },
      {
        key: 'actions',
        header: ''
      }
    ];

    const pipelinesFormatted = pipelines.map(pipeline => ({
      id: `${pipeline.metadata.namespace}:${pipeline.metadata.name}`,
      name: (
        <Link
          to={urls.pipelineRuns.byPipeline({
            namespace: pipeline.metadata.namespace,
            pipelineName: pipeline.metadata.name
          })}
          title={pipeline.metadata.name}
        >
          {pipeline.metadata.name}
        </Link>
      ),
      namespace: pipeline.metadata.namespace,
      createdTime: (
        <FormattedDate date={pipeline.metadata.creationTimestamp} relative />
      ),
      actions: (
        <Link
          to={urls.rawCRD.byNamespace({
            namespace: pipeline.metadata.namespace,
            type: 'pipelines',
            name: pipeline.metadata.name
          })}
        >
          <Information16 className="tkn--resource-info-icon">
            <title>
              {intl.formatMessage(
                {
                  id: 'dashboard.resourceList.viewDetails',
                  defaultMessage: 'View {resource}'
                },
                { resource: pipeline.metadata.name }
              )}
            </title>
          </Information16>
        </Link>
      )
    }));

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelines.errorLoading',
            defaultMessage: 'Error loading Pipelines'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <ListPageLayout title="Pipelines" {...this.props}>
        <Table
          headers={initialHeaders}
          rows={pipelinesFormatted}
          loading={loading && !pipelinesFormatted.length}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} in any namespace.'
            },
            { kind: 'Pipelines' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} in namespace {selectedNamespace}'
            },
            { kind: 'Pipelines', selectedNamespace }
          )}
        />
      </ListPageLayout>
    );
  }
}

Pipelines.defaultProps = {
  filters: [],
  pipelines: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getPipelinesErrorMessage(state),
    filters,
    loading: isFetchingPipelines(state),
    namespace,
    pipelines: getPipelines(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelines
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Pipelines));
