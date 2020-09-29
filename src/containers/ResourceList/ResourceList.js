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
/* istanbul ignore file */
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { InlineNotification } from 'carbon-components-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getErrorMessage, getTitle, urls } from '@tektoncd/dashboard-utils';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';

import { getAPIResource, getCustomResources } from '../../api';
import { getSelectedNamespace, isWebSocketConnected } from '../../reducers';

export class ResourceListContainer extends Component {
  state = {
    loading: true,
    namespaced: true,
    resources: []
  };

  componentDidMount() {
    const { group, version, type } = this.props.match.params;
    document.title = getTitle({
      page: `${group}/${version}/${type}`
    });
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
    return getAPIResource({ group, version, type })
      .then(({ namespaced }) => {
        this.setState({ namespaced });
        return getCustomResources({
          group,
          version,
          type,
          namespace: namespaced ? namespace : null
        });
      })
      .then(resources => {
        this.setState({
          loading: false,
          resources
        });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  render() {
    const { intl, match } = this.props;
    const { group, type, version } = match.params;
    const { error, loading, namespaced, resources } = this.state;

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage(
            {
              id: 'dashboard.resourceList.errorLoading',
              defaultMessage: 'Error loading {type}'
            },
            { type }
          )}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    const emptyText = intl.formatMessage(
      {
        id: 'dashboard.resourceList.emptyState',
        defaultMessage: 'No resources for type {type}.'
      },
      { type }
    );

    return (
      <>
        <h1>{`${group}/${version}/${type}`}</h1>
        <Table
          headers={[
            {
              key: 'name',
              header: intl.formatMessage({
                id: 'dashboard.tableHeader.name',
                defaultMessage: 'Name'
              })
            },
            namespaced
              ? {
                  key: 'namespace',
                  header: 'Namespace'
                }
              : null,
            {
              key: 'createdTime',
              header: intl.formatMessage({
                id: 'dashboard.tableHeader.createdTime',
                defaultMessage: 'Created'
              })
            }
          ].filter(Boolean)}
          rows={resources.map(resource => {
            const {
              creationTimestamp,
              name,
              namespace,
              uid
            } = resource.metadata;

            return {
              id: uid,
              name: (
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
                  title={name}
                >
                  {name}
                </Link>
              ),
              namespace,
              createdTime: <FormattedDate date={creationTimestamp} relative />
            };
          })}
          loading={loading}
          emptyTextAllNamespaces={emptyText}
          emptyTextSelectedNamespace={emptyText}
        />
      </>
    );
  }
}

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(ResourceListContainer));
