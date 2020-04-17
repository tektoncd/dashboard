/*
Copyright 2020 The Tekton Authors
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

import {
  getClusterTasks,
  isFetchingClusterTasks,
  isWebSocketConnected
} from '../../reducers';
import { fetchClusterTasks } from '../../actions/tasks';

class ClusterTasksDropdown extends React.Component {
  componentDidMount() {
    this.props.fetchClusterTasks();
  }

  componentDidUpdate(prevProps) {
    const { webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (webSocketConnected && prevWebSocketConnected === false) {
      this.props.fetchClusterTasks();
    }
  }

  render() {
    const {
      fetchClusterTasks: _fetchClusterTasks,
      intl,
      label,
      webSocketConnected,
      ...rest
    } = this.props;
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
      <TooltipDropdown {...rest} emptyText={emptyText} label={labelString} />
    );
  }
}

ClusterTasksDropdown.defaultProps = {
  items: [],
  loading: false,
  titleText: 'ClusterTask'
};

function mapStateToProps(state) {
  return {
    items: getClusterTasks(state).map(clusterTask => clusterTask.metadata.name),
    loading: isFetchingClusterTasks(state),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTasks
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ClusterTasksDropdown));
