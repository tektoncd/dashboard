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

/**
 * to rename. Details section of a step
 */

import React from 'react';
import { Link } from 'react-router-dom';
import jsYaml from 'js-yaml';

import ResourceTable from '../ResourceTable';
import { urls } from '../../utils';

import './StepDefinition.scss';

const resourceTable = (title, namespace, resources) => {
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
            <pre>{jsYaml.dump(resourceSpec)}</pre>
          )
      }))}
      headers={[
        { key: 'name', header: 'Name' },
        { key: 'value', header: 'Value' }
      ]}
    />
  );
};

const StepDefinition = ({ definition, taskRun }) => {
  const yaml = jsYaml.dump(definition);
  return (
    <div className="step-definition">
      <div className="title">Step definition:</div>
      <pre>{yaml}</pre>
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
          taskRun.inputResources
        )}
      {taskRun.outputResources &&
        resourceTable(
          'Output Resources',
          taskRun.namespace,
          taskRun.outputResources
        )}
    </div>
  );
};

StepDefinition.defaultProps = {
  definition: 'description: step definition not available',
  taskRun: {}
};

export default StepDefinition;
