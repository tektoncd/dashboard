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
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';

import Information16 from '@carbon/icons-react/lib/information/16';
import { fetchClusterTasks } from '../../actions/tasks';
import {
  getClusterTasks,
  getClusterTasksErrorMessage,
  isFetchingClusterTasks
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class ClusterTasksContainer extends Component {
  componentDidMount() {
    this.props.fetchClusterTasks();
  }

  render() {
    const { error, loading, clusterTasks } = this.props;

    if (loading && !clusterTasks.length) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
        <InlineNotification
          hideCloseButton
          kind="error"
          title="Error loading ClusterTasks"
          subtitle={error}
          lowContrast
        />
      );
    }
    return (
      <StructuredListWrapper border selection>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>ClusterTask</StructuredListCell>
            <StructuredListCell head />
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {!clusterTasks.length && (
            <StructuredListRow>
              <StructuredListCell>No ClusterTasks</StructuredListCell>
            </StructuredListRow>
          )}
          {clusterTasks.map(task => {
            const { name: taskName, uid } = task.metadata;
            return (
              <StructuredListRow className="definition" key={uid}>
                <StructuredListCell>
                  <Link to={`/clustertasks/${taskName}/runs`}>{taskName}</Link>
                </StructuredListCell>
                <StructuredListCell>
                  <Link
                    title="ClusterTask definition"
                    to={`/clustertasks/${taskName}`}
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

ClusterTasksContainer.defaultProps = {
  clusterTasks: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getClusterTasksErrorMessage(state),
    loading: isFetchingClusterTasks(state),
    clusterTasks: getClusterTasks(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTasks
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClusterTasksContainer);
