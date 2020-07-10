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
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { getTitle } from '@tektoncd/dashboard-utils';
import { ResourceDetails } from '@tektoncd/dashboard-components';

import { fetchClusterTask, fetchTask } from '../../actions/tasks';
import { fetchPipeline } from '../../actions/pipelines';

import {
  getClusterTask,
  getClusterTasksErrorMessage,
  getPipeline,
  getPipelinesErrorMessage,
  getTask,
  getTasksErrorMessage,
  isWebSocketConnected
} from '../../reducers';
import { getViewChangeHandler } from '../../utils';

import { getCustomResource } from '../../api';

export /* istanbul ignore next */ class CustomResourceDefinition extends Component {
  state = {
    loading: true
  };

  componentDidMount() {
    const { match } = this.props;
    const { name, type } = match.params;
    document.title = getTitle({
      page: type,
      resourceName: name
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { name, namespace, type } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      name: prevName,
      namespace: prevNamespace,
      type: prevType
    } = prevMatch.params;
    if (
      namespace !== prevNamespace ||
      name !== prevName ||
      type !== prevType ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetch = ({ group, version, name, namespace, type }) => {
    switch (type) {
      case 'tasks':
        return this.props.fetchTask({ name, namespace });
      case 'pipelines':
        return this.props.fetchPipeline({ name, namespace });
      case 'clustertasks':
        return this.props.fetchClusterTask(name);
      default:
        return getCustomResource({
          group,
          version,
          type,
          namespace,
          name
        }).then(resource => {
          this.setState({ resource });
        });
    }
  };

  fetchData() {
    const { match } = this.props;
    const { group, version, name, namespace, type } = match.params;
    this.setState({ loading: true }); // eslint-disable-line
    this.fetch({ group, version, name, namespace, type }).then(() =>
      this.setState({ loading: false })
    );
  }

  render() {
    const error = this.props.error || this.state.error;
    const resource = this.props.resource || this.state.resource;
    const { loading } = this.state;

    const { view } = this.props;

    return (
      <ResourceDetails
        error={error}
        loading={loading}
        onViewChange={getViewChangeHandler(this.props)}
        resource={resource}
        view={view}
      />
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { name, type } = ownProps.match.params;
  const { namespace } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const resourceMap = {
    clustertasks: getClusterTask(state, name),
    tasks: getTask(state, { name, namespace }),
    pipelines: getPipeline(state, {
      name,
      namespace
    })
  };
  const errorMap = {
    clustertasks: getClusterTasksErrorMessage(state),
    tasks: getTasksErrorMessage(state),
    pipelines: getPipelinesErrorMessage(state)
  };

  return {
    error: errorMap[type],
    namespace,
    resource: resourceMap[type],
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTask,
  fetchPipeline,
  fetchTask
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CustomResourceDefinition));
