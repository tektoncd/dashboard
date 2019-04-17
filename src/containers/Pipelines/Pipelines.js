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
import {
  Breadcrumb,
  BreadcrumbItem,
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';

import Header from '../../components/Header';
import { getPipelines } from '../../api';
import { fetchPipelines } from '../../actions/pipeline';

import '../../components/Pipelines/Pipelines.scss';

/* istanbul ignore next */
export class Pipelines extends Component {
  state = {
    error: null,
    loading: true,
    pipelines: []
  };

  async componentDidMount() {
    try {
      const pipelines = await getPipelines();
      this.setState({ pipelines, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { error, loading, pipelines } = this.state;

    return (
      <div className="pipelines">
        <Header>
          <div className="pipelines-header">
            <Breadcrumb>
              <BreadcrumbItem href="#">Pipelines</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </Header>

        <main>
          {(() => {
            if (loading) {
              return <StructuredListSkeleton border />;
            }

            if (error) {
              return (
                <InlineNotification
                  kind="error"
                  title="Error loading pipelines"
                  subtitle={JSON.stringify(error)}
                />
              );
            }

            return (
              <StructuredListWrapper border selection>
                <StructuredListHead>
                  <StructuredListRow head>
                    <StructuredListCell head>Pipeline</StructuredListCell>
                  </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                  {pipelines.map(pipeline => {
                    const pipelineName = pipeline.metadata.name;
                    return (
                      <StructuredListRow
                        className="pipeline"
                        key={pipeline.metadata.uid}
                      >
                        <StructuredListCell>
                          <Link to={`/pipelines/${pipelineName}/runs`}>
                            {pipelineName}
                          </Link>
                        </StructuredListCell>
                      </StructuredListRow>
                    );
                  })}
                </StructuredListBody>
              </StructuredListWrapper>
            );
          })()}
        </main>
      </div>
    );
  }
}

export default connect(
  null,
  { fetchPipelines }
)(Pipelines);
