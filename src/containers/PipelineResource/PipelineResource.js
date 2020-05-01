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
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTable,
  InlineNotification,
  Tab,
  Tabs,
  Tag
} from 'carbon-components-react';
import {
  DataTableSkeleton,
  FormattedDate,
  ViewYAML
} from '@tektoncd/dashboard-components';
import {
  formatLabels,
  getErrorMessage,
  getTitle
} from '@tektoncd/dashboard-utils';

import {
  getPipelineResource,
  getPipelineResourcesErrorMessage,
  isFetchingPipelineResources,
  isWebSocketConnected
} from '../../reducers';

import { fetchPipelineResource } from '../../actions/pipelineResources';

const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} = DataTable;

export /* istanbul ignore next */ class PipelineResourceContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { pipelineResourceName: resourceName } = match.params;
    document.title = getTitle({
      page: 'PipelineResource',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, pipelineResourceName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      pipelineResourceName: prevPipelineResourceName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      pipelineResourceName !== prevPipelineResourceName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, pipelineResourceName } = match.params;
    this.props.fetchPipelineResource({ name: pipelineResourceName, namespace });
  }

  render() {
    const { error, intl, loading, match, pipelineResource } = this.props;
    const { pipelineResourceName } = match.params;

    if (loading && !pipelineResource) {
      return <DataTableSkeleton />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineResource.errorLoading',
            defaultMessage: 'Error loading PipelineResource'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    if (!pipelineResource) {
      return (
        <InlineNotification
          kind="info"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineResource.failed',
            defaultMessage: 'Cannot load PipelineResource'
          })}
          subtitle={intl.formatMessage(
            {
              id: 'dashboard.pipelineResource.failedSubtitle',
              defaultMessage:
                'PipelineResource {pipelineResourceName} not found'
            },
            { pipelineResourceName }
          )}
        />
      );
    }

    const { params, secrets, type } = pipelineResource.spec;
    let formattedLabelsToRender = [];
    if (pipelineResource.metadata.labels) {
      formattedLabelsToRender = formatLabels(pipelineResource.metadata.labels);
    }

    return (
      <>
        <h1>{pipelineResourceName}</h1>

        <Tabs selected={0} aria-label="PipelineResource details">
          <Tab
            id={`${pipelineResourceName}-overview`}
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
                    date={pipelineResource.metadata.creationTimestamp}
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
                  {formattedLabelsToRender.length
                    ? formattedLabelsToRender.map(label => (
                        <Tag type="blue" key={label}>
                          {label}
                        </Tag>
                      ))
                    : intl.formatMessage({
                        id: 'dashboard.metadata.none',
                        defaultMessage: 'None'
                      })}
                </p>
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.metadata.namespace',
                      defaultMessage: 'Namespace:'
                    })}
                  </span>
                  {pipelineResource.metadata.namespace}
                </p>
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.pipelineResource.type',
                      defaultMessage: 'Type:'
                    })}
                  </span>
                  {type}
                </p>
              </div>

              <DataTable
                rows={params.map(({ name, value }) => ({
                  id: name,
                  name,
                  value
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
                    key: 'value',
                    header: intl.formatMessage({
                      id: 'dashboard.tableHeader.value',
                      defaultMessage: 'Value'
                    })
                  }
                ]}
                render={({
                  rows,
                  headers,
                  getHeaderProps,
                  getRowProps,
                  getTableProps
                }) => (
                  <TableContainer title="Params">
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map(header => (
                            <TableHeader {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map(row => (
                          <TableRow {...getRowProps({ row })}>
                            {row.cells.map(cell => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              />

              {secrets && (
                <DataTable
                  rows={secrets.map(({ fieldName, secretKey, secretName }) => ({
                    id: fieldName,
                    fieldName,
                    secretKey,
                    secretName
                  }))}
                  headers={[
                    {
                      key: 'fieldName',
                      header: intl.formatMessage({
                        id: 'dashboard.pipelineResource.fieldName',
                        defaultMessage: 'Field Name'
                      })
                    },
                    {
                      key: 'secretKey',
                      header: intl.formatMessage({
                        id: 'dashboard.pipelineResource.secretKey',
                        defaultMessage: 'Secret Key'
                      })
                    },
                    {
                      key: 'secretName',
                      header: intl.formatMessage({
                        id: 'dashboard.pipelineResource.secretName',
                        defaultMessage: 'Secret Name'
                      })
                    }
                  ]}
                  render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getRowProps,
                    getTableProps
                  }) => (
                    <TableContainer title="Secrets">
                      <Table {...getTableProps()}>
                        <TableHead>
                          <TableRow>
                            {headers.map(header => (
                              <TableHeader {...getHeaderProps({ header })}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map(row => (
                            <TableRow {...getRowProps({ row })}>
                              {row.cells.map(cell => (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                />
              )}
            </div>
          </Tab>
          <Tab id={`${pipelineResourceName}-yaml`} label="YAML">
            <ViewYAML resource={pipelineResource} />
          </Tab>
        </Tabs>
      </>
    );
  }
}

PipelineResourceContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      namespace: PropTypes.string.isRequired,
      pipelineResourceName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace, pipelineResourceName: name } = match.params;

  return {
    error: getPipelineResourcesErrorMessage(state),
    loading: isFetchingPipelineResources(state),
    namespace,
    pipelineResource: getPipelineResource(state, {
      name,
      namespace
    }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineResource
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineResourceContainer));
