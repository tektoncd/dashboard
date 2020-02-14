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

import React from 'react';
import { connect } from 'react-redux';
import { ALL_NAMESPACES } from '@tektoncd/dashboard-utils';
import { TooltipDropdown } from '@tektoncd/dashboard-components';

import {
  getPipelineResources,
  getSelectedNamespace,
  isFetchingPipelineResources,
  isWebSocketConnected
} from '../../reducers';
import { fetchPipelineResources } from '../../actions/pipelineResources';

class PipelineResourcesDropdown extends React.Component {
  componentDidMount() {
    const { namespace } = this.props;
    this.props.fetchPipelineResources({ namespace });
  }

  componentDidUpdate(prevProps) {
    const { namespace, webSocketConnected } = this.props;
    const { webSocketConnected: prevWebSocketConnected } = prevProps;
    if (
      namespace !== prevProps.namespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.props.fetchPipelineResources({ namespace });
    }
  }

  render() {
    const {
      fetchPipelineResources: _fetchPipelineResources, // extract props that are not valid for the dropdown
      namespace,
      type,
      webSocketConnected,
      ...rest
    } = this.props;
    let emptyText = 'No PipelineResources found';
    if (type && namespace !== ALL_NAMESPACES) {
      emptyText = `No PipelineResources found of type '${type}' in the '${namespace}' namespace`;
    } else if (type) {
      emptyText = `No PipelineResources found of type '${type}'`;
    } else if (namespace !== ALL_NAMESPACES) {
      emptyText = `No PipelineResources found in the '${namespace}' namespace`;
    }
    return <TooltipDropdown {...rest} emptyText={emptyText} />;
  }
}

PipelineResourcesDropdown.defaultProps = {
  items: [],
  loading: false,
  label: 'Select PipelineResource',
  titleText: 'PipelineResource'
};

function mapStateToProps(state, ownProps) {
  const namespace = ownProps.namespace || getSelectedNamespace(state);
  const { type } = ownProps;
  return {
    items: getPipelineResources(state, { namespace })
      .filter(pipelineResource => !type || type === pipelineResource.spec.type)
      .map(pipelineResource => pipelineResource.metadata.name),
    loading: isFetchingPipelineResources(state),
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineResources
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelineResourcesDropdown);
