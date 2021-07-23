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

import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  ALL_NAMESPACES,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import { isWebSocketConnected } from '../../reducers';
import { useSelectedNamespace, useTasks } from '../../api';

function TasksDropdown({
  intl,
  label,
  namespace: namespaceProp,
  webSocketConnected,
  ...rest
}) {
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceProp || selectedNamespace;

  const { data: tasks = [], isFetching, refetch } = useTasks({ namespace });
  useWebSocketReconnected(refetch, webSocketConnected);

  const items = tasks.map(task => task.metadata.name);

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
    <TooltipDropdown
      {...rest}
      emptyText={emptyText}
      items={items}
      label={labelString}
      loading={isFetching}
    />
  );
}

TasksDropdown.defaultProps = {
  titleText: 'Task'
};

function mapStateToProps(state) {
  return {
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(TasksDropdown));
