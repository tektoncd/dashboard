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
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';

import { ALL_NAMESPACES } from '../../constants';
import { fetchPipelineResources } from '../../actions/pipelineResources';

import {
  getPipelineResources,
  getPipelineResourcesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineResources
} from '../../reducers';

export /* istanbul ignore next */ class PipelineResources extends Component {
  componentDidMount() {
    this.fetchPipelineResources();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    const { namespace: prevNamespace } = prevProps;

    if (namespace !== prevNamespace) {
      this.fetchPipelineResources();
    }
  }

  fetchPipelineResources() {
    const { namespace } = this.props;
    this.props.fetchPipelineResources({
      namespace
    });
  }

  render() {
    const {
      error,
      loading,
      namespace: selectedNamespace,
      pipelineResources
    } = this.props;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading PipelineResources"
          subtitle={JSON.stringify(error)}
        />
      );
    }

    return (
      <StructuredListWrapper border selection>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Pipeline Resource</StructuredListCell>
            {selectedNamespace === ALL_NAMESPACES && (
              <StructuredListCell head>Namespace</StructuredListCell>
            )}
            <StructuredListCell head>Type</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {!pipelineResources.length && (
            <StructuredListRow>
              <StructuredListCell>
                <span>No PipelineResources</span>
              </StructuredListCell>
            </StructuredListRow>
          )}
          {pipelineResources.map(pipelineResource => {
            const {
              name: pipelineResourceName,
              namespace
            } = pipelineResource.metadata;

            return (
              <StructuredListRow
                className="definition"
                key={pipelineResource.metadata.uid}
              >
                <StructuredListCell>
                  <Link
                    to={`/namespaces/${namespace}/pipelineresources/${pipelineResourceName}`}
                  >
                    {pipelineResourceName}
                  </Link>
                </StructuredListCell>
                {selectedNamespace === ALL_NAMESPACES && (
                  <StructuredListCell>{namespace}</StructuredListCell>
                )}
                <StructuredListCell>
                  {pipelineResource.spec.type}
                </StructuredListCell>
              </StructuredListRow>
            );
          })}
        </StructuredListBody>
      </StructuredListWrapper>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getPipelineResourcesErrorMessage(state),
    loading: isFetchingPipelineResources(state),
    namespace,
    pipelineResources: getPipelineResources(state, { namespace })
  };
}

const mapDispatchToProps = {
  fetchPipelineResources
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelineResources);
