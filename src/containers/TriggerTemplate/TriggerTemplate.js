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
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { DataTable } from 'carbon-components-react';
import {
  Table as DashboardTable,
  ResourceDetails,
  ViewYAML
} from '@tektoncd/dashboard-components';
import { getTitle } from '@tektoncd/dashboard-utils';
import {
  getSelectedNamespace,
  getTriggerTemplate,
  getTriggerTemplatesErrorMessage,
  isFetchingTriggerTemplates,
  isWebSocketConnected
} from '../../reducers';
import { getViewChangeHandler } from '../../utils';

import { fetchTriggerTemplate } from '../../actions/triggerTemplates';

import '../../scss/Triggers.scss';

const {
  Table,
  TableBody,
  TableContainer,
  TableExpandedRow,
  TableExpandRow,
  TableExpandHeader,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} = DataTable;

export /* istanbul ignore next */ class TriggerTemplateContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { triggerTemplateName: resourceName } = match.params;
    document.title = getTitle({
      page: 'TriggerTemplate',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, triggerTemplateName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      triggerTemplateName: prevTriggerTemplateName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      triggerTemplateName !== prevTriggerTemplateName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  getContent() {
    const { intl, selectedNamespace, triggerTemplate } = this.props;

    if (!triggerTemplate) {
      return null;
    }

    const { params, resourcetemplates } = triggerTemplate.spec;

    const headersForParameters = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'default',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.default',
          defaultMessage: 'Default'
        })
      },
      {
        key: 'description',
        header: intl.formatMessage({
          id: 'dashboard.resourceDetails.description',
          defaultMessage: 'Description'
        })
      }
    ];

    let rowsForParameters = [];
    if (params) {
      rowsForParameters = params.map(
        ({ name, default: defaultValue, description }) => ({
          id: name,
          name,
          default: defaultValue,
          description
        })
      );
    }

    const emptyTextMessage = intl.formatMessage({
      id: 'dashboard.triggerTemplate.noParams',
      defaultMessage: 'No parameters found for this template.'
    });

    return (
      <>
        <DashboardTable
          title={intl.formatMessage({
            id: 'dashboard.paramaters.title',
            defaultMessage: 'Parameters'
          })}
          headers={headersForParameters}
          rows={rowsForParameters}
          size="short"
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={emptyTextMessage}
          emptyTextSelectedNamespace={emptyTextMessage}
        />

        {resourcetemplates && (
          // This is a very customised expandable table so intentionally not the one used elsewhere
          // although it should look the same
          <div className="tkn--table">
            <DataTable
              rows={resourcetemplates.map((item, index) => ({
                id: `${index}|${
                  item.metadata.name || item.metadata.generateName
                }`,
                name: item.metadata.name || item.metadata.generateName,
                kind: item.kind
              }))}
              headers={[
                {
                  key: 'name',
                  header: intl.formatMessage({
                    id: 'dashboard.tableHeader.name',
                    defaultMessage: 'Name'
                  })
                },
                {
                  key: 'kind',
                  header: 'Kind'
                }
              ]}
              size="short"
              render={({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps
              }) => (
                <TableContainer
                  data-testid="resourcetemplatestable"
                  title={intl.formatMessage({
                    id: 'dashboard.triggerTemplate.resourceTemplates',
                    defaultMessage: 'Resource Templates'
                  })}
                >
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader />
                        {headers.map(header => (
                          <TableHeader {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map(cell => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableExpandRow>
                          {row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1}>
                              <ViewYAML
                                resource={
                                  triggerTemplate.spec.resourcetemplates[index]
                                }
                                dark
                              />
                            </TableExpandedRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            />
          </div>
        )}
      </>
    );
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, triggerTemplateName } = match.params;
    this.props.fetchTriggerTemplate({ name: triggerTemplateName, namespace });
  }

  render() {
    const { error, loading, triggerTemplate, view } = this.props;

    return (
      <ResourceDetails
        error={error}
        loading={loading}
        onViewChange={getViewChangeHandler(this.props)}
        resource={triggerTemplate}
        view={view}
      >
        {this.getContent()}
      </ResourceDetails>
    );
  }
}

TriggerTemplateContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      triggerTemplateName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { location, match } = ownProps;
  const { namespace: namespaceParam, triggerTemplateName } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const namespace = namespaceParam || getSelectedNamespace(state);
  const triggerTemplate = getTriggerTemplate(state, {
    name: triggerTemplateName,
    namespace
  });
  return {
    error: getTriggerTemplatesErrorMessage(state),
    loading: isFetchingTriggerTemplates(state),
    selectedNamespace: namespace,
    triggerTemplate,
    view,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchTriggerTemplate
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TriggerTemplateContainer));
