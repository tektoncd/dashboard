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
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace } = match.params;
  return {
    error: getTasksErrorMessage(state) || getPipelinesErrorMessage(state),
    namespace,
    resource:
      ownProps.match.params.type === 'tasks'
        ? getTask(state, { name: ownProps.match.params.name, namespace })
        : getPipeline(state, { name: ownProps.match.params.name, namespace })
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
