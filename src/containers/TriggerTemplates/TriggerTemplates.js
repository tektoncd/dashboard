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
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import {
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  urls
} from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import {
  FormattedDate,
  LabelFilter,
  Table
} from '@tektoncd/dashboard-components';
import { fetchTriggerTemplates } from '../../actions/triggerTemplates';
import {
  getSelectedNamespace,
  getTriggerTemplates,
  getTriggerTemplatesErrorMessage,
  isFetchingTriggerTemplates,
  isWebSocketConnected
} from '../../reducers';

export /* istanbul ignore next */ class TriggerTemplates extends Component {
  componentDidMount() {
    this.fetchTriggerTemplates();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      !isEqual(filters, prevFilters) ||
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchTriggerTemplates();
    }
  }

  fetchTriggerTemplates() {
    const { filters, namespace } = this.props;
    this.props.fetchTriggerTemplates({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      filters,
      intl,
      loading,
      selectedNamespace,
      triggerTemplates
    } = this.props;

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      },
      {
        key: 'date',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      }
    ];

    const triggerTemplatesFormatted = triggerTemplates.map(template => ({
      id: `${template.metadata.namespace}:${template.metadata.name}`,
      name: (
        <Link
          to={urls.triggerTemplates.byName({
            namespace: template.metadata.namespace,
            triggerTemplateName: template.metadata.name
          })}
          title={template.metadata.name}
        >
          {template.metadata.name}
        </Link>
      ),
      namespace: (
        <span title={template.metadata.namespace}>
          {template.metadata.namespace}
        </span>
      ),
      date: (
        <FormattedDate date={template.metadata.creationTimestamp} relative />
      )
    }));

    return (
      <>
        {error && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(error)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            lowContrast
          />
        )}
        <h1>TriggerTemplates</h1>
        <LabelFilter
          filters={filters}
          handleAddFilter={getAddFilterHandler(this.props)}
          handleDeleteFilter={getDeleteFilterHandler(this.props)}
        />
        <Table
          headers={initialHeaders}
          rows={triggerTemplatesFormatted}
          loading={loading}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} under any namespace.'
            },
            { kind: 'TriggerTemplates' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} under namespace {selectedNamespace}'
            },
            { kind: 'TriggerTemplates', selectedNamespace }
          )}
        />
      </>
    );
  }
}

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getTriggerTemplatesErrorMessage(state),
    filters,
    loading: isFetchingTriggerTemplates(state),
    triggerTemplates: getTriggerTemplates(state, { filters, namespace }),
    selectedNamespace: namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTriggerTemplates
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TriggerTemplates));
