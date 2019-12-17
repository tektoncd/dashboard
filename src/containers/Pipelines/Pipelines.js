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
import Information16 from '@carbon/icons-react/lib/information/16';
import { injectIntl } from 'react-intl';

import { InlineNotification } from 'carbon-components-react';
import { getErrorMessage, urls } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

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
    this.props.fetchPipelines();
  }

  componentDidUpdate(prevProps) {
    const { namespace, webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (
      namespace !== prevProps.namespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.props.fetchPipelines();
    }
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
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'link',
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
        >
          {pipeline.metadata.name}
        </Link>
      ),
      namespace: pipeline.metadata.namespace,
      createdTime: (
        <FormattedDate date={pipeline.metadata.creationTimestamp} relative />
      ),
      link: (
        <Link
          to={urls.rawCRD.byNamespace({
            namespace: pipeline.metadata.namespace,
            type: 'pipelines',
            name: pipeline.metadata.name
          })}
        >
          <Information16 className="resource-info-icon" />
        </Link>
      )
    }));

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading Pipelines"
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <>
        <h1>Pipelines</h1>
        <Table
          headers={initialHeaders}
          rows={pipelinesFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'Pipelines' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'Pipelines', selectedNamespace }
          )}
        />
      </>
    );
  }
}

Pipelines.defaultProps = {
  pipelines: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getPipelinesErrorMessage(state),
    loading: isFetchingPipelines(state),
    namespace,
    pipelines: getPipelines(state, { namespace }),
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
