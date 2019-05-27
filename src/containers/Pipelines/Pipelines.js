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

import { fetchPipelines } from '../../actions/pipelines';
import {
  getPipelines,
  getPipelinesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelines
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class Pipelines extends Component {
  componentDidMount() {
    this.props.fetchPipelines();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    if (namespace !== prevProps.namespace) {
      this.props.fetchPipelines();
    }
  }

  render() {
    const { error, loading, pipelines } = this.props;

    return (
      <>
        {(() => {
          if (loading && !pipelines.length) {
            return <StructuredListSkeleton border />;
          }

          if (error) {
            return (
              <InlineNotification
                kind="error"
                title="Error loading pipelines"
                subtitle={error}
              />
            );
          }

          return (
            <StructuredListWrapper border selection>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Pipeline</StructuredListCell>
                  <StructuredListCell head />
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {!pipelines.length && (
                  <StructuredListRow>
                    <StructuredListCell>No pipelines</StructuredListCell>
                  </StructuredListRow>
                )}
                {pipelines.map(pipeline => {
                  const pipelineName = pipeline.metadata.name;
                  return (
                    <StructuredListRow
                      className="definition"
                      key={pipeline.metadata.uid}
                    >
                      <StructuredListCell>
                        <Link to={`/pipelines/${pipelineName}/runs`}>
                          {pipelineName}
                        </Link>
                      </StructuredListCell>
                      <StructuredListCell>
                        <Link
                          title="pipeline definition"
                          to={`/pipelines/${pipelineName}`}
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
        })()}
      </>
    );
  }
}

Pipelines.defaultProps = {
  pipelines: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getPipelinesErrorMessage(state),
    loading: isFetchingPipelines(state),
    namespace: getSelectedNamespace(state),
    pipelines: getPipelines(state)
  };
}

const mapDispatchToProps = {
  fetchPipelines
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pipelines);
