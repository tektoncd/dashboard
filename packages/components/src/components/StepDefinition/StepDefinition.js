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
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { getResources, urls } from '@tektoncd/dashboard-utils';

import { ResourceTable, ViewYAML } from '..';

const resourceTable = (title, namespace, resources, intl) => (
  <ResourceTable
    title={title}
    rows={resources.map(({ name, resourceRef, resourceSpec }) => ({
      id: name,
      name,
      value:
        resourceRef && resourceRef.name ? (
          <Link
            to={urls.pipelineResources.byName({
              namespace,
              pipelineResourceName: resourceRef.name
            })}
          >
            {resourceRef.name}
          </Link>
        ) : (
          <ViewYAML resource={resourceSpec} dark />
        )
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
  />
);

class StepDefinition extends Component {
  getIOTables() {
    const { intl, showIO, taskRun } = this.props;

    if (!showIO) {
      return null;
    }

    const { namespace } = taskRun.metadata;
    const { inputResources, outputResources } = getResources(taskRun.spec);

    return (
      <>
        {inputResources &&
          resourceTable(
            intl.formatMessage({
              id: 'dashboard.stepDefinition.inputResources',
              defaultMessage: 'Input Resources'
            }),
            namespace,
            inputResources,
            intl
          )}
        {outputResources &&
          resourceTable(
            intl.formatMessage({
              id: 'dashboard.stepDefinition.outputResources',
              defaultMessage: 'Output Resources'
            }),
            namespace,
            outputResources,
            intl
          )}
      </>
    );
  }

  render() {
    const { definition, intl } = this.props;

    const resources = this.getIOTables();
    return (
      <>
        <ViewYAML
          resource={
            definition ||
            intl.formatMessage({
              id: 'dashboard.step.definitionNotAvailable',
              defaultMessage: 'Step definition not available'
            })
          }
          dark
        />
        {resources}
      </>
    );
  }
}

StepDefinition.defaultProps = {
  showIO: false,
  taskRun: {}
};

export default injectIntl(StepDefinition);
