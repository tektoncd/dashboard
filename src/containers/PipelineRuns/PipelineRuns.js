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

import { getStatusIcon, getStatus } from '../../utils';
import { fetchPipelineRuns } from '../../actions/pipelineRuns';

import {
  getPipelineRunsByPipelineName,
  getPipelineRunsErrorMessage,
  isFetchingPipelineRuns
} from '../../reducers';

export /* istanbul ignore next */ class PipelineRuns extends Component {
  async componentDidMount() {
    const { params } = this.props.match;
    const { pipelineName } = params;
    this.props.fetchPipelineRuns(pipelineName);
  }

  render() {
    const { match, error, loading, pipelineRuns } = this.props;
    const { pipelineName } = match.params;

    return (
      <>
        {(() => {
          if (loading) {
            return <StructuredListSkeleton border />;
          }

          if (error) {
            return (
              <InlineNotification
                kind="error"
                title="Error loading pipeline runs"
                subtitle={JSON.stringify(error)}
              />
            );
          }

          if (!pipelineRuns.length) {
            return <span>No pipeline runs for {pipelineName}</span>;
          }

          return (
            <StructuredListWrapper border selection>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Pipeline Run</StructuredListCell>
                  <StructuredListCell head>Status</StructuredListCell>
                  <StructuredListCell head>
                    Last Transition Time
                  </StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {pipelineRuns.map(pipelineRun => {
                  const pipelineRunName = pipelineRun.metadata.name;
                  const { lastTransitionTime, reason, status } = getStatus(
                    pipelineRun
                  );

                  return (
                    <StructuredListRow
                      className="definition"
                      key={pipelineRun.metadata.uid}
                    >
                      <StructuredListCell>
                        <Link
                          to={`/pipelines/${pipelineName}/runs/${pipelineRunName}`}
                        >
                          {pipelineRunName}
                        </Link>
                      </StructuredListCell>
                      <StructuredListCell
                        className="status"
                        data-reason={reason}
                        data-status={status}
                      >
                        {getStatusIcon({ reason, status })}
                        {pipelineRun.status.conditions[0].message}
                      </StructuredListCell>
                      <StructuredListCell>
                        {lastTransitionTime}
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

/* istanbul ignore next */
function mapStateToProps(state, props) {
  return {
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    pipelineRuns: getPipelineRunsByPipelineName(
      state,
      props.match.params.pipelineName
    )
  };
}

const mapDispatchToProps = {
  fetchPipelineRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelineRuns);
