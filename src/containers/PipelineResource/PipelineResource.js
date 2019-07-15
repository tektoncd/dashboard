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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTable,
  DataTableSkeleton,
  InlineNotification
} from 'carbon-components-react';

import {
  getPipelineResource,
  getPipelineResourcesErrorMessage,
  isFetchingPipelineResources
} from '../../reducers';
import { getErrorMessage } from '../../utils';

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
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { namespace, pipelineResourceName } = match.params;
    const { match: prevMatch } = prevProps;
    const {
      namespace: prevNamespace,
      pipelineResourceName: prevPipelineResourceName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      pipelineResourceName !== prevPipelineResourceName
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
    const { error, loading, match, pipelineResource } = this.props;
    const { pipelineResourceName } = match.params;

    if (loading) {
      return (
        <DataTableSkeleton
          headers={[
            { key: 'name', header: 'Param Name' },
            { key: 'value', header: 'Value' }
          ]}
        />
      );
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading PipelineResource"
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
          title="Cannot load PipelineResource"
          subtitle={`PipelineResource ${pipelineResourceName} not found`}
        />
      );
    }

    const { params, secrets, type } = pipelineResource.spec;

    return (
      <>
        <h1>{pipelineResourceName}</h1>
        <h2>{`Type: ${type}`}</h2>

        <DataTable
          rows={params.map(({ name, value }) => ({
            id: name,
            name,
            value
          }))}
          headers={[
            { key: 'name', header: 'Name' },
            { key: 'value', header: 'Value' }
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
              { key: 'fieldName', header: 'Field Name' },
              { key: 'secretKey', header: 'Secret Key' },
              { key: 'secretName', header: 'Secret Name' }
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
    })
  };
}

const mapDispatchToProps = {
  fetchPipelineResource
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelineResourceContainer);
