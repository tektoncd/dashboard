/*
Copyright 2020-2021 The Tekton Authors
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

import React, { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import {
  getSelectedNamespace,
  getTasks,
  isFetchingTasks,
  isWebSocketConnected
} from '../../reducers';
import { fetchTasks as fetchTasksActionCreator } from '../../actions/tasks';

function TasksDropdown({
  fetchTasks,
  intl,
  label,
  namespace,
  webSocketConnected,
  ...rest
}) {
  useEffect(() => {
    fetchTasks({ namespace });
  }, [namespace, webSocketConnected]);

  const emptyText =
    namespace === ALL_NAMESPACES
      ? intl.formatMessage({
          id: 'dashboard.tasksDropdown.empty.allNamespaces',
          defaultMessage: 'No Tasks found'
        })
      : intl.formatMessage(
          {
            id: 'dashboard.tasksDropdown.empty.selectedNamespace',
            defaultMessage: "No Tasks found in the ''{namespace}'' namespace"
          },
          { namespace }
        );

  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.tasksDropdown.label',
      defaultMessage: 'Select Task'
    });

  return (
    <TooltipDropdown {...rest} emptyText={emptyText} label={labelString} />
  );
}

TasksDropdown.defaultProps = {
  items: [],
  loading: false,
  titleText: 'Task'
};

function mapStateToProps(state, ownProps) {
  const namespace = ownProps.namespace || getSelectedNamespace(state);
  return {
    items: getTasks(state, { namespace }).map(task => task.metadata.name),
    loading: isFetchingTasks(state),
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTasks: fetchTasksActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TasksDropdown));
