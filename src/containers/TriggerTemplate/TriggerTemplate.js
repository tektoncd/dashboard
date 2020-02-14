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
import { DataTable, InlineNotification, Tag } from 'carbon-components-react';
import {
  Table as DashboardTable,
  FormattedDate,
  Tab,
  Tabs,
  ViewYAML
} from '@tektoncd/dashboard-components';
import { formatLabels } from '@tektoncd/dashboard-utils';
import {
  getSelectedNamespace,
  getTriggerTemplate,
  getTriggerTemplatesErrorMessage,
  isWebSocketConnected
} from '../../reducers';

import { fetchTriggerTemplate } from '../../actions/triggerTemplates';

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
  static notification({ kind, message, intl }) {
    const titles = {
      info: intl.formatMessage({
        id: 'dashboard.triggerTemplate.unavailable',
        defaultMessage: 'TriggerTemplate not available'
      }),
      error: intl.formatMessage({
        id: 'dashboard.triggerTemplate.errorloading',
        defaultMessage: 'Error loading TriggerTemplate'
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

  fetchData() {
    const { match } = this.props;
    const { namespace, triggerTemplateName } = match.params;
    this.props.fetchTriggerTemplate({ name: triggerTemplateName, namespace });
  }

  render() {
    const {
      intl,
      error,
      match,
      selectedNamespace,
      triggerTemplate
    } = this.props;
    const { triggerTemplateName } = match.params;

    if (error) {
      return TriggerTemplateContainer.notification({
        kind: 'error',
        intl
      });
    }
    if (!triggerTemplate) {
      return TriggerTemplateContainer.notification({
        kind: 'error',
        message: intl.formatMessage({
          id: 'dashboard.triggerTemplate.unavailable',
          defaultMessage: 'TriggerTemplate not available'
        }),
        intl
      });
    }

    const { params, resourcetemplates } = triggerTemplate.spec;

    let formattedLabelsToRender = [];
    if (triggerTemplate.metadata.labels) {
      formattedLabelsToRender = formatLabels(triggerTemplate.metadata.labels);
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
        key: 'default',
        header: intl.formatMessage({
          id: 'dashboard.triggerTemplate.default',
          defaultMessage: 'Default'
        })
      },
      {
        key: 'description',
        header: intl.formatMessage({
          id: 'dashboard.triggerTemplate.description',
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
      <div className="trigger">
        <h1>{triggerTemplateName}</h1>
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
                    date={triggerTemplate.metadata.creationTimestamp}
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
                  {triggerTemplate.metadata.namespace}
                </p>
              </div>

              <DashboardTable
                title={intl.formatMessage({
                  id: 'dashboard.paramaters.title',
                  defaultMessage: 'Parameters'
                })}
                headers={headersForParameters}
                rows={rowsForParameters}
                selectedNamespace={selectedNamespace}
                emptyTextAllNamespaces={emptyTextMessage}
                emptyTextSelectedNamespace={emptyTextMessage}
              />

              {resourcetemplates && (
                // This is a very customised expandable table so intentionally not the one used elsewhere
                // although it should look the same
                <DataTable
                  rows={resourcetemplates.map((item, index) => ({
                    id: `${index}|${item.metadata.name ||
                      item.metadata.generateName}`
                  }))}
                  headers={[
                    {
                      header: intl.formatMessage({
                        id: 'dashboard.triggerTemplate.resourceNameHeader',
                        defaultMessage: 'Resource name to create'
                      }),
                      key: 'header'
                    }
                  ]}
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
                                  <TableCell key={cell.id}>
                                    {triggerTemplate.spec.resourcetemplates[
                                      index
                                    ].metadata.name ||
                                      triggerTemplate.spec.resourcetemplates[
                                        index
                                      ].metadata.generateName}
                                  </TableCell>
                                ))}
                              </TableExpandRow>
                              {row.isExpanded && (
                                <TableExpandedRow colSpan={headers.length + 1}>
                                  <ViewYAML
                                    resource={
                                      triggerTemplate.spec.resourcetemplates[
                                        index
                                      ]
                                    }
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
              )}
            </div>
          </Tab>
          <Tab label="YAML">
            <ViewYAML resource={triggerTemplate} />
          </Tab>
        </Tabs>
      </div>
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
  const { match } = ownProps;
  const { namespace: namespaceParam, triggerTemplateName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);
  const triggerTemplate = getTriggerTemplate(state, {
    name: triggerTemplateName,
    namespace
  });
  return {
    error: getTriggerTemplatesErrorMessage(state),
    selectedNamespace: namespace,
    triggerTemplate,
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
