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
import { fetchTasks } from '../../actions/tasks';
import {
  getSelectedNamespace,
  getTasks,
  getTasksErrorMessage,
  isFetchingTasks
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class Tasks extends Component {
  componentDidMount() {
    this.props.fetchTasks();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    if (namespace !== prevProps.namespace) {
      this.props.fetchTasks();
    }
  }

  render() {
    const { error, loading, tasks } = this.props;

    return (
      <>
        {(() => {
          if (loading && !tasks.length) {
            return <StructuredListSkeleton border />;
          }

          if (error) {
            return (
              <InlineNotification
                kind="error"
                title="Error loading tasks"
                subtitle={error}
              />
            );
          }

          return (
            <StructuredListWrapper border selection>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Task</StructuredListCell>
                  <StructuredListCell head />
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {!tasks.length && (
                  <StructuredListRow>
                    <StructuredListCell>No tasks</StructuredListCell>
                  </StructuredListRow>
                )}
                {tasks.map(task => {
                  const taskName = task.metadata.name;
                  return (
                    <StructuredListRow
                      className="definition"
                      key={task.metadata.uid}
                    >
                      <StructuredListCell>
                        <Link to={`/tasks/${taskName}/runs`}>{taskName}</Link>
                      </StructuredListCell>
                      <StructuredListCell>
                        <Link title="task definition" to={`/tasks/${taskName}`}>
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

Tasks.defaultProps = {
  tasks: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getTasksErrorMessage(state),
    loading: isFetchingTasks(state),
    namespace: getSelectedNamespace(state),
    tasks: getTasks(state)
  };
}

const mapDispatchToProps = {
  fetchTasks
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tasks);
