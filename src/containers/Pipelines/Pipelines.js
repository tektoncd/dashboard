/*
Copyright 2019 The Tekton Authors
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

import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';
import { getErrorMessage, urls } from '@tektoncd/dashboard-utils';

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
    const { error, loading, pipelines } = this.props;

    if (loading && !pipelines.length) {
      return <StructuredListSkeleton border />;
    }

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
      <StructuredListWrapper border selection>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Pipeline</StructuredListCell>
            <StructuredListCell head>Namespace</StructuredListCell>
            <StructuredListCell head />
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {!pipelines.length && (
            <StructuredListRow>
              <StructuredListCell>No Pipelines</StructuredListCell>
            </StructuredListRow>
          )}
          {pipelines.map(pipeline => {
            const { name, namespace, uid } = pipeline.metadata;
            return (
              <StructuredListRow className="definition" key={uid}>
                <StructuredListCell>
                  <Link
                    to={urls.pipelineRuns.byPipeline({
                      namespace,
                      pipelineName: name
                    })}
                  >
                    {name}
                  </Link>
                </StructuredListCell>
                <StructuredListCell>{namespace}</StructuredListCell>
                <StructuredListCell>
                  <Link
                    title="Pipeline definition"
                    to={urls.rawCRD.byNamespace({
                      namespace,
                      type: 'pipelines',
                      name
                    })}
                  >
                    <Information16 className="resource-info-icon" />
                  </Link>
                </StructuredListCell>
              </StructuredListRow>
            );
          })}
        </StructuredListBody>
      </StructuredListWrapper>
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
)(Pipelines);
