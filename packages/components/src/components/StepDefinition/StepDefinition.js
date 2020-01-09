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

// TODO: rename. Details section of a step

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { urls } from '@tektoncd/dashboard-utils';

import { ResourceTable, ViewYAML } from '..';
import './StepDefinition.scss';

const resourceTable = (title, namespace, resources, intl) => {
  return (
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
            <ViewYAML resource={resourceSpec} />
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
};

class StepDefinition extends Component {
  getIOTables() {
    const { intl, showIO, taskRun } = this.props;

    if (!showIO) {
      return null;
    }

    return (
      <>
        {taskRun.params && (
          <ResourceTable
            title="Parameters"
            rows={taskRun.params.map(({ name, value }) => ({
              id: name,
              name,
              value
            }))}
            headers={[
              { key: 'name', header: 'Name' },
              { key: 'value', header: 'Value' }
            ]}
          />
        )}
        {taskRun.inputResources &&
          resourceTable(
            'Input Resources',
            taskRun.namespace,
            taskRun.inputResources,
            intl
          )}
        {taskRun.outputResources &&
          resourceTable(
            'Output Resources',
            taskRun.namespace,
            taskRun.outputResources,
            intl
          )}
      </>
    );
  }

  render() {
    const { definition, intl } = this.props;

    const paramsResources = this.getIOTables();
    return (
      <div className="step-definition">
        <div className="title">
          <FormattedMessage
            id="dashboard.step.stepDefinition"
            defaultMessage="Step definition"
          />
          :
        </div>
        <ViewYAML
          resource={
            definition ||
            intl.formatMessage({
              id: 'dashboard.step.definitionNotAvailable',
              defaultMessage: 'description: step definition not available'
            })
          }
        />
        {paramsResources}
      </div>
    );
  }
}

StepDefinition.defaultProps = {
  showIO: false,
  taskRun: {}
};

export default injectIntl(StepDefinition);
