/*
Copyright 2019-2021 The Tekton Authors
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

import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { DataTable } from 'carbon-components-react';
import { ResourceDetails } from '@tektoncd/dashboard-components';
import { useTitleSync } from '@tektoncd/dashboard-utils';

import { usePipelineResource } from '../../api';
import { getViewChangeHandler } from '../../utils';

const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} = DataTable;

/* istanbul ignore next */
function PipelineResource({ intl }) {
  const history = useHistory();
  const location = useLocation();
  const { namespace, pipelineResourceName: resourceName } = useParams();

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  useTitleSync({
    page: 'PipelineResource',
    resourceName
  });

  const { data: pipelineResource, error, isFetching } = usePipelineResource({
    name: resourceName,
    namespace
  });

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
      loading={isFetching}
      onViewChange={getViewChangeHandler({ history, location })}
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
                defaultMessage: 'Field name'
              })
            },
            {
              key: 'secretKey',
              header: intl.formatMessage({
                id: 'dashboard.pipelineResource.secretKey',
                defaultMessage: 'Secret key'
              })
            },
            {
              key: 'secretName',
              header: intl.formatMessage({
                id: 'dashboard.pipelineResource.secretName',
                defaultMessage: 'Secret name'
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

export default injectIntl(PipelineResource);
