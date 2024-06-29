/*
Copyright 2019-2024 The Tekton Authors
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

import { Fragment } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { DataTable } from 'carbon-components-react';
import {
  Table as DashboardTable,
  ResourceDetails,
  ViewYAML
} from '@tektoncd/dashboard-components';
import { useTitleSync } from '@tektoncd/dashboard-utils';

import { useSelectedNamespace, useTriggerTemplate } from '../../api';
import { getViewChangeHandler } from '../../utils';

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

export /* istanbul ignore next */ function TriggerTemplateContainer() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { namespace, name: resourceName } = useParams();

  const queryParams = new URLSearchParams(location.search);
  const view = queryParams.get('view');

  const { selectedNamespace: defaultNamespace } = useSelectedNamespace();
  const selectedNamespace = namespace || defaultNamespace;

  useTitleSync({
    page: 'TriggerTemplate',
    resourceName
  });

  const {
    data: triggerTemplate,
    error,
    isFetching
  } = useTriggerTemplate({
    name: resourceName,
    namespace
  });

  function getContent() {
    if (!triggerTemplate) {
      return null;
    }

    const {
      params,
      resourceTemplates: newResourceTemplates,
      resourcetemplates: oldResourceTemplates
    } = triggerTemplate.spec;
    const resourceTemplates = oldResourceTemplates || newResourceTemplates;

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
            id: 'dashboard.parameters.title',
            defaultMessage: 'Parameters'
          })}
          headers={headersForParameters}
          rows={rowsForParameters}
          size="sm"
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={emptyTextMessage}
          emptyTextSelectedNamespace={emptyTextMessage}
        />
        {resourceTemplates && (
          // This is a very customised expandable table so intentionally not the one used elsewhere
          // although it should look the same
          <div className="tkn--table">
            <DataTable
              rows={resourceTemplates.map((item, index) => ({
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
              size="sm"
              render={({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps
              }) => (
                <TableContainer
                  title={intl.formatMessage({
                    id: 'dashboard.triggerTemplate.resourceTemplates',
                    defaultMessage: 'Resource templates'
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
                        <Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map(cell => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableExpandRow>
                          {row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1}>
                              <ViewYAML
                                resource={resourceTemplates[index]}
                                dark
                              />
                            </TableExpandedRow>
                          )}
                        </Fragment>
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

  return (
    <ResourceDetails
      error={error}
      loading={isFetching}
      onViewChange={getViewChangeHandler({ location, navigate })}
      resource={triggerTemplate}
      view={view}
    >
      {getContent()}
    </ResourceDetails>
  );
}

export default TriggerTemplateContainer;
