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
import { connect } from 'react-redux';
import {
  CodeSnippetSkeleton,
  InlineNotification
} from 'carbon-components-react';

import jsYaml from 'js-yaml';

import { fetchClusterTask, fetchTask } from '../../actions/tasks';
import { fetchPipeline } from '../../actions/pipelines';
import { getErrorMessage } from '../../utils';

import {
  getClusterTask,
  getClusterTasksErrorMessage,
  getPipeline,
  getPipelinesErrorMessage,
  getTask,
  getTasksErrorMessage
} from '../../reducers';

export /* istanbul ignore next */ class CustomResourceDefinition extends Component {
  state = {
    loading: true
  };

  componentDidMount() {
    const { match } = this.props;
    const { name, namespace, type } = match.params;
    this.fetch({ name, namespace, type }).then(() =>
      this.setState({ loading: false })
    );
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { name, namespace, type } = match.params;
    const { match: prevMatch } = prevProps;
    const {
      name: prevName,
      namespace: prevNamespace,
      type: prevType
    } = prevMatch.params;
    if (namespace !== prevNamespace || name !== prevName || type !== prevType) {
      this.setState({ loading: true }); // eslint-disable-line
      this.fetch({ name, namespace, type }).then(() =>
        this.setState({ loading: false })
      );
    }
  }

  fetch = ({ name, namespace, type }) => {
    switch (type) {
      case 'tasks':
        return this.props.fetchTask({ name, namespace });
      case 'pipelines':
        return this.props.fetchPipeline({ name, namespace });
      case 'clustertasks':
        return this.props.fetchClusterTask(name);
      default:
        return Promise.resolve();
    }
  };

  render() {
    const { error, resource } = this.props;
    const { loading } = this.state;

    if (loading) {
      return <CodeSnippetSkeleton type="multi" />;
    }

    if (error || !resource) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading resource"
          subtitle={getErrorMessage(error)}
        />
      );
    }
    return (
      <div className="bx--snippet--multi">
        <code>
          <pre>{jsYaml.dump(resource)}</pre>
        </code>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { name, type } = ownProps.match.params;
  const { namespace } = match.params;
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
    resource: resourceMap[type]
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
)(CustomResourceDefinition);
