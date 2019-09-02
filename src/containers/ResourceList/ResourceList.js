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

import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  ALL_NAMESPACES,
  getErrorMessage,
  urls
} from '@tektoncd/dashboard-utils';

import { getCustomResources } from '../../api';
import { getSelectedNamespace, isWebSocketConnected } from '../../reducers';

export /* istanbul ignore next */ class ResourceListContainer extends Component {
  state = {
    loading: true,
    resources: []
  };

  componentDidMount() {
    const { group, version, type } = this.props.match.params;
    const { namespace } = this.props;
    this.fetchResources(group, version, type, namespace);
  }

  componentDidUpdate(prevProps) {
    const { match, namespace, webSocketConnected } = this.props;
    const { group, version, type } = match.params;
    const {
      match: prevMatch,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      type: prevType,
      group: prevGroup,
      version: prevVersion
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      type !== prevType ||
      group !== prevGroup ||
      version !== prevVersion ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchResources(group, version, type, namespace);
    }
  }

  fetchResources(group, version, type, namespace) {
    return getCustomResources({ group, version, type, namespace }).then(
      resources => {
        this.setState({
          loading: false,
          resources
        });
      }
    );
  }

  render() {
    const { match, namespace: selectedNamespace } = this.props;
    const { group, version, type } = match.params;
    const { error, loading, resources } = this.state;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={`Error loading ${type}`}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <StructuredListWrapper border selection>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Resource</StructuredListCell>
            {selectedNamespace === ALL_NAMESPACES && (
              <StructuredListCell head>Namespace</StructuredListCell>
            )}
            <StructuredListCell head>Created</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {!resources.length && (
            <StructuredListRow>
              <StructuredListCell>
                <span>No Resources for type {type}</span>
              </StructuredListCell>
            </StructuredListRow>
          )}
          {resources.map(resource => {
            const {
              name,
              namespace,
              creationTimestamp,
              uid
            } = resource.metadata;
            return (
              <StructuredListRow className="definition" key={uid}>
                <StructuredListCell>
                  <Link
                    to={
                      namespace
                        ? urls.kubernetesResources.byName({
                            namespace,
                            group,
                            version,
                            type,
                            name
                          })
                        : urls.kubernetesResources.cluster({
                            group,
                            version,
                            type,
                            name
                          })
                    }
                  >
                    {name}
                  </Link>
                </StructuredListCell>
                {selectedNamespace === ALL_NAMESPACES && (
                  <StructuredListCell>{namespace}</StructuredListCell>
                )}
                <StructuredListCell>{creationTimestamp}</StructuredListCell>
              </StructuredListRow>
            );
          })}
        </StructuredListBody>
      </StructuredListWrapper>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(ResourceListContainer);
