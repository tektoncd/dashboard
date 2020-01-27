/*
Copyright 2019-2020 The Tekton Authors
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
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { InlineNotification } from 'carbon-components-react';
import {
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  urls
} from '@tektoncd/dashboard-utils';
import {
  FormattedDate,
  LabelFilter,
  Table
} from '@tektoncd/dashboard-components';
import Information16 from '@carbon/icons-react/lib/information/16';
import { fetchTasks } from '../../actions/tasks';
import {
  getSelectedNamespace,
  getTasks,
  getTasksErrorMessage,
  isFetchingTasks,
  isWebSocketConnected
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export /* istanbul ignore next */ class Tasks extends Component {
  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    if (
      namespace !== prevProps.namespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchTasks({ filters, namespace });
  }

  render() {
    const {
      error,
      filters,
      loading,
      tasks,
      intl,
      namespace: selectedNamespace
    } = this.props;

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'actions',
        header: ''
      }
    ];

    const tasksFormatted = tasks.map(task => ({
      id: `${task.metadata.namespace}:${task.metadata.name}`,
      name: (
        <Link
          to={urls.taskRuns.byTask({
            namespace: task.metadata.namespace,
            taskName: task.metadata.name
          })}
          title={task.metadata.name}
        >
          {task.metadata.name}
        </Link>
      ),
      namespace: (
        <span title={task.metadata.namespace}>{task.metadata.namespace}</span>
      ),
      createdTime: (
        <FormattedDate date={task.metadata.creationTimestamp} relative />
      ),
      actions: (
        <Link
          to={urls.rawCRD.byNamespace({
            namespace: task.metadata.namespace,
            type: 'tasks',
            name: task.metadata.name
          })}
        >
          <Information16 className="resource-info-icon" />
        </Link>
      )
    }));

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading Tasks"
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <>
        <h1>Tasks</h1>
        <LabelFilter
          filters={filters}
          handleAddFilter={getAddFilterHandler(this.props)}
          handleDeleteFilter={getDeleteFilterHandler(this.props)}
        />
        <Table
          headers={initialHeaders}
          rows={tasksFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'Tasks' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'Tasks', selectedNamespace }
          )}
        />
      </>
    );
  }
}

Tasks.defaultProps = {
  filters: [],
  tasks: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getTasksErrorMessage(state),
    filters,
    loading: isFetchingTasks(state),
    namespace,
    tasks: getTasks(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTasks
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Tasks));
