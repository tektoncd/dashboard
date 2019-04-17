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
import { getTasks } from '../../api';

import '../../components/Definitions/Definitions.scss';

/* istanbul ignore next */
class Tasks extends Component {
  state = {
    error: null,
    loading: true,
    tasks: []
  };

  async componentDidMount() {
    try {
      const tasks = await getTasks();
      this.setState({ tasks, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { error, loading, tasks } = this.state;

    return (
      <div className="definitions">
        <Header>
          <div className="definitions-header">
            <Breadcrumb>
              <BreadcrumbItem href="#">Tasks</BreadcrumbItem>
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
                  title="Error loading tasks"
                  subtitle={JSON.stringify(error)}
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

export default Tasks;
