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
import PropTypes from 'prop-types';
import '../../scss/Triggers.scss';
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
  getSelectedNamespace,
  getTriggerBinding,
  getTriggerBindingsErrorMessage,
  isWebSocketConnected
} from '../../reducers';

import { fetchTriggerBinding } from '../../actions/triggerBindings';

export /* istanbul ignore next */ class TriggerBindingContainer extends Component {
  static notification({ kind, message, intl }) {
    const titles = {
      info: intl.formatMessage({
        id: 'dashboard.triggerBinding.unavailable',
        defaultMessage: 'TriggerBinding not available'
      }),
      error: intl.formatMessage({
        id: 'dashboard.triggerBinding.errorloading',
        defaultMessage: 'Error loading TriggerBinding'
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
    const { namespace, triggerBindingName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      triggerBindingName: prevTriggerBindingName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      triggerBindingName !== prevTriggerBindingName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, triggerBindingName } = match.params;
    this.props.fetchTriggerBinding({ name: triggerBindingName, namespace });
  }

  render() {
    const {
      intl,
      error,
      match,
      selectedNamespace,
      triggerBinding
    } = this.props;
    const { triggerBindingName } = match.params;

    if (error) {
      return TriggerBindingContainer.notification({
        kind: 'error',
        intl
      });
    }
    if (!triggerBinding) {
      return TriggerBindingContainer.notification({
        kind: 'info',
        intl
      });
    }

    let formattedLabelsToRender = [];
    if (triggerBinding.metadata.labels) {
      formattedLabelsToRender = formatLabels(triggerBinding.metadata.labels);
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

    const rowsForParameters = triggerBinding.spec.params.map(
      ({ name, value }) => ({
        id: name,
        name,
        value
      })
    );

    const emptyTextMessage = intl.formatMessage({
      id: 'dashboard.triggerBinding.noParams',
      defaultMessage: 'No parameters found for this TriggerBinding.'
    });

    return (
      <div className="trigger">
        <h1>{triggerBindingName}</h1>
        <Tabs selected={0}>
          <Tab
            label={intl.formatMessage({
              id: 'dashboard.resource.detailsTab',
              defaultMessage: 'Details'
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
                    date={triggerBinding.metadata.creationTimestamp}
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
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.metadata.namespace',
                      defaultMessage: 'Namespace:'
                    })}
                  </span>
                  {triggerBinding.metadata.namespace}
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
            <ViewYAML resource={triggerBinding} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

TriggerBindingContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      triggerBindingName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace: namespaceParam, triggerBindingName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);
  const triggerBinding = getTriggerBinding(state, {
    name: triggerBindingName,
    namespace
  });
  return {
    error: getTriggerBindingsErrorMessage(state),
    selectedNamespace: namespace,
    triggerBinding,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTriggerBinding
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TriggerBindingContainer));
