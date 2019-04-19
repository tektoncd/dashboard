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
import { Link, NavLink } from 'react-router-dom';
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
import { fetchTasks } from '../../actions/tasks';
import {
  getTasks,
  getTasksErrorMessage,
  isFetchingTasks
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class Tasks extends Component {
  componentDidMount() {
    this.props.fetchTasks();
  }

  render() {
    const { error, loading, tasks } = this.props;

    return (
      <div className="definitions">
        <Header>
          <div className="definitions-header">
            <Breadcrumb>
              <BreadcrumbItem>
                <NavLink to="/tasks">Tasks</NavLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        </Header>
        <main>
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
                  </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
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

Tasks.defaultProps = {
  tasks: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getTasksErrorMessage(state),
    loading: isFetchingTasks(state),
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
