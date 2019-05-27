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

import { fetchTask } from '../../actions/tasks';
import { fetchPipeline } from '../../actions/pipelines';

import {
  getPipeline,
  getSelectedNamespace,
  getTask,
  getTasksErrorMessage,
  getPipelinesErrorMessage
} from '../../reducers';

export /* istanbul ignore next */ class CustomResourceDefinition extends Component {
  state = {
    loading: true
  };

  componentDidMount() {
    const { match } = this.props;
    const { name, type } = match.params;
    this.fetch(type, name).then(() => this.setState({ loading: false }));
  }

  componentDidUpdate(prevProps) {
    const { match, namespace } = this.props;
    const { name, type } = match.params;
    const { match: prevMatch, namespace: prevNamespace } = prevProps;
    const { name: prevName, type: prevType } = prevMatch.params;
    if (namespace !== prevNamespace || name !== prevName || type !== prevType) {
      this.setState({ loading: true }); // eslint-disable-line
      this.fetch(type, name).then(() => this.setState({ loading: false }));
    }
  }

  fetch = (type, name) => {
    switch (type) {
      case 'tasks':
        return this.props.fetchTask({ name });
      case 'pipelines':
        return this.props.fetchPipeline({ name });
      default:
        return Promise.resolve();
    }
  };

  render() {
    const { error } = this.props;
    const { loading } = this.state;
    const { resource } = this.props;

    if (loading) {
      return <CodeSnippetSkeleton type="multi" />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          title="Error loading resource"
          subtitle={JSON.stringify(error)}
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
function mapStateToProps(state, props) {
  return {
    namespace: getSelectedNamespace(state),
    error: getTasksErrorMessage(state) || getPipelinesErrorMessage(state),
    resource:
      props.match.params.type === 'tasks'
        ? getTask(state, { name: props.match.params.name })
        : getPipeline(state, { name: props.match.params.name })
  };
}

const mapDispatchToProps = {
  fetchPipeline,
  fetchTask
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomResourceDefinition);
