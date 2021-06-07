/*
Copyright 2019-2021 The Tekton Authors
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

import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  useTitleSync,
  useWebSocketReconnected
} from '@tektoncd/dashboard-utils';
import { ResourceDetails } from '@tektoncd/dashboard-components';

import { fetchClusterInterceptor as fetchClusterInterceptorActionCreator } from '../../actions/clusterInterceptors';
import { fetchPipeline as fetchPipelineActionCreator } from '../../actions/pipelines';
import {
  fetchClusterTask as fetchClusterTaskActionCreator,
  fetchTask as fetchTaskActionCreator
} from '../../actions/tasks';
import {
  getClusterInterceptor,
  getClusterInterceptorsErrorMessage,
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

/* istanbul ignore next */
function CustomResourceDefinition(props) {
  const {
    error,
    fetchClusterInterceptor,
    fetchClusterTask,
    fetchPipeline,
    fetchTask,
    match,
    resource,
    view,
    webSocketConnected
  } = props;
  const { group, name, namespace, type, version } = match.params;

  const [loading, setLoading] = useState(true);
  const [customResource, setCustomResource] = useState(null);

  useTitleSync({
    page: type,
    resourceName: name
  });

  function fetch() {
    switch (type) {
      case 'clusterinterceptors':
        return fetchClusterInterceptor({ name });
      case 'clustertasks':
        return fetchClusterTask(name);
      case 'pipelines':
        return fetchPipeline({ name, namespace });
      case 'tasks':
        return fetchTask({ name, namespace });
      default:
        return getCustomResource({
          group,
          version,
          type,
          namespace,
          name
        }).then(res => {
          setCustomResource(res);
        });
    }
  }

  function fetchData() {
    setLoading(true);
    fetch().then(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, [name, namespace, type]);

  useWebSocketReconnected(fetchData, webSocketConnected);

  return (
    <ResourceDetails
      error={error}
      loading={loading}
      onViewChange={getViewChangeHandler(props)}
      resource={resource || customResource}
      view={view}
    />
  );
}

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { name, type } = ownProps.match.params;
  const { namespace } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const resourceMap = {
    clusterinterceptors: getClusterInterceptor(state, { name }),
    clustertasks: getClusterTask(state, name),
    tasks: getTask(state, { name, namespace }),
    pipelines: getPipeline(state, {
      name,
      namespace
    })
  };
  const errorMap = {
    clusterinterceptors: getClusterInterceptorsErrorMessage(state),
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
  fetchClusterInterceptor: fetchClusterInterceptorActionCreator,
  fetchClusterTask: fetchClusterTaskActionCreator,
  fetchPipeline: fetchPipelineActionCreator,
  fetchTask: fetchTaskActionCreator
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CustomResourceDefinition));
