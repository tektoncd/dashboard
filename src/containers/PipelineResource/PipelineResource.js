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
import { DataTable } from 'carbon-components-react';
import { ResourceDetails } from '@tektoncd/dashboard-components';
import { getTitle } from '@tektoncd/dashboard-utils';

import {
  getPipelineResource,
  getPipelineResourcesErrorMessage,
  isFetchingPipelineResources,
  isWebSocketConnected
} from '../../reducers';
import { getViewChangeHandler } from '../../utils';

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
    const { error, intl, loading, pipelineResource, view } = this.props;
    const { params = [], secrets, type } = pipelineResource?.spec || {};

    return (
      <ResourceDetails
        additionalMetadata={
          <p>
            <span>
              {intl.formatMessage({
                id: 'dashboard.pipelineResource.type',
                defaultMessage: 'Type:'
              })}
            </span>
            {type}
          </p>
        }
        error={error}
        loading={loading}
        onViewChange={getViewChangeHandler(this.props)}
        resource={pipelineResource}
        view={view}
      >
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
            <TableContainer title="Params" className="tkn--table">
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
              <TableContainer title="Secrets" className="tkn--table">
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
        )}
      </ResourceDetails>
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
  const { location, match } = ownProps;
  const { namespace, pipelineResourceName: name } = match.params;

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  return {
    error: getPipelineResourcesErrorMessage(state),
    loading: isFetchingPipelineResources(state),
    namespace,
    pipelineResource: getPipelineResource(state, {
      name,
      namespace
    }),
    view,
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
