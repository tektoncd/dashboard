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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { InlineNotification, Tag } from 'carbon-components-react';
import {
  FormattedDate,
  Tab,
  Table,
  Tabs,
  ViewYAML
} from '@tektoncd/dashboard-components';
import { formatLabels } from '@tektoncd/dashboard-utils';
import {
  getClusterTriggerBinding,
  getClusterTriggerBindingsErrorMessage,
  isWebSocketConnected
} from '../../reducers';

import { fetchClusterTriggerBinding } from '../../actions/clusterTriggerBindings';

import '../../scss/Triggers.scss';

export /* istanbul ignore next */ class ClusterTriggerBindingContainer extends Component {
  static notification({ kind, message, intl }) {
    const titles = {
      info: intl.formatMessage({
        id: 'dashboard.clusterTriggerBinding.unavailable',
        defaultMessage: 'ClusterTriggerBinding not available'
      }),
      error: intl.formatMessage({
        id: 'dashboard.clusterTriggerBinding.errorloading',
        defaultMessage: 'Error loading ClusterTriggerBinding'
      })
    };
    return (
      <InlineNotification
        kind={kind}
        hideCloseButton
        lowContrast
        title={titles[kind]}
        subtitle={message}
      />
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { clusterTriggerBindingName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      clusterTriggerBindingName: prevClusterTriggerBindingName
    } = prevMatch.params;

    if (
      clusterTriggerBindingName !== prevClusterTriggerBindingName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { match } = this.props;
    const { clusterTriggerBindingName } = match.params;
    this.props.fetchClusterTriggerBinding({
      name: clusterTriggerBindingName
    });
  }

  render() {
    const {
      intl,
      error,
      match,
      selectedNamespace,
      clusterTriggerBinding
    } = this.props;
    const { clusterTriggerBindingName } = match.params;

    if (error) {
      return ClusterTriggerBindingContainer.notification({
        kind: 'error',
        intl
      });
    }
    if (!clusterTriggerBinding) {
      return ClusterTriggerBindingContainer.notification({
        kind: 'info',
        intl
      });
    }

    let formattedLabelsToRender = [];
    if (clusterTriggerBinding.metadata.labels) {
      formattedLabelsToRender = formatLabels(
        clusterTriggerBinding.metadata.labels
      );
    }

    const headersForParameters = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'value',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.value',
          defaultMessage: 'Value'
        })
      }
    ];

    const rowsForParameters = clusterTriggerBinding.spec.params.map(
      ({ name, value }) => ({
        id: name,
        name,
        value
      })
    );

    const emptyTextMessage = intl.formatMessage({
      id: 'dashboard.clusterTriggerBinding.noParams',
      defaultMessage: 'No parameters found for this ClusterTriggerBinding.'
    });

    return (
      <div className="trigger">
        <h1>{clusterTriggerBindingName}</h1>
        <Tabs selected={0}>
          <Tab
            label={intl.formatMessage({
              id: 'dashboard.resource.overviewTab',
              defaultMessage: 'Overview'
            })}
          >
            <div className="details">
              <div className="resource--detail-block">
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.metadata.dateCreated',
                      defaultMessage: 'Date Created:'
                    })}
                  </span>
                  <FormattedDate
                    date={clusterTriggerBinding.metadata.creationTimestamp}
                    relative
                  />
                </p>
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.metadata.labels',
                      defaultMessage: 'Labels:'
                    })}
                  </span>
                  {formattedLabelsToRender.length === 0
                    ? intl.formatMessage({
                        id: 'dashboard.metadata.none',
                        defaultMessage: 'None'
                      })
                    : formattedLabelsToRender.map(label => (
                        <Tag type="blue" key={label}>
                          {label}
                        </Tag>
                      ))}
                </p>
              </div>
              <Table
                title={intl.formatMessage({
                  id: 'dashboard.parameters.title',
                  defaultMessage: 'Parameters'
                })}
                headers={headersForParameters}
                rows={rowsForParameters}
                selectedNamespace={selectedNamespace}
                emptyTextAllNamespaces={emptyTextMessage}
                emptyTextSelectedNamespace={emptyTextMessage}
              />
            </div>
          </Tab>
          <Tab label="YAML">
            <ViewYAML resource={clusterTriggerBinding} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

ClusterTriggerBindingContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      clusterTriggerBindingName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { clusterTriggerBindingName } = match.params;

  const clusterTriggerBinding = getClusterTriggerBinding(state, {
    name: clusterTriggerBindingName
  });
  return {
    error: getClusterTriggerBindingsErrorMessage(state),
    clusterTriggerBinding,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTriggerBinding
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ClusterTriggerBindingContainer));
