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
import { TooltipDropdown } from '@tektoncd/dashboard-components';
import { useWebSocketReconnected } from '@tektoncd/dashboard-utils';

import { isWebSocketConnected } from '../../reducers';
import { useClusterTasks } from '../../api';

function ClusterTasksDropdown({ intl, label, webSocketConnected, ...rest }) {
  const { data: clusterTasks = [], isFetching, refetch } = useClusterTasks();
  useWebSocketReconnected(refetch, webSocketConnected);

  const items = clusterTasks.map(clusterTask => clusterTask.metadata.name);

  const emptyText = intl.formatMessage({
    id: 'dashboard.clusterTasksDropdown.empty',
    defaultMessage: 'No ClusterTasks found'
  });

  const labelString =
    label ||
    intl.formatMessage({
      id: 'dashboard.clusterTasksDropdown.label',
      defaultMessage: 'Select ClusterTask'
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

ClusterTasksDropdown.defaultProps = {
  titleText: 'ClusterTask'
};

function mapStateToProps(state) {
  return {
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ClusterTasksDropdown));
