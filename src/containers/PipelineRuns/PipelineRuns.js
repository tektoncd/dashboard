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

import { getPipelineRuns } from '../../api';
import { getSelectedNamespace } from '../../reducers';
import { getStatusIcon, getStatus } from '../../utils';

export /* istanbul ignore next */ class PipelineRuns extends Component {
  state = {
    error: null,
    loading: true,
    pipelineRuns: []
  };

  async componentDidMount() {
    try {
      const { match, namespace } = this.props;
      const { pipelineName } = match.params;

      let pipelineRuns = await getPipelineRuns(namespace);
      pipelineRuns = pipelineRuns.filter(
        pipelineRun => pipelineRun.spec.pipelineRef.name === pipelineName
      );
      this.setState({ pipelineRuns, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { match } = this.props;
    const { pipelineName } = match.params;
    const { error, loading, pipelineRuns } = this.state;

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
function mapStateToProps(state) {
  return {
    namespace: getSelectedNamespace(state)
  };
}

export default connect(mapStateToProps)(PipelineRuns);
