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

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';

export default function Breadcrumbs({ labels, match }) {
  const { url } = match;
  let pathSegments = url.split('/').filter(Boolean);

  let namespacePrefix = '';
  if (pathSegments[0] === 'namespaces') {
    namespacePrefix = `/${pathSegments.slice(0, 2).join('/')}`;
    pathSegments = pathSegments.slice(2);
  }

  return (
    <Breadcrumb>
      {pathSegments.map((segment, index) => {
        if (segment === 'runs') {
          return null;
        }
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const to = labels[path] ? path : `${namespacePrefix}${path}`;
        return (
          <BreadcrumbItem key={segment}>
            <NavLink exact to={to}>
              {labels[path] || segment}
            </NavLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}

const breadcrumbLabels = {
  '/extensions': 'Extensions',
  '/importresources': 'Import Tekton Resources',
  '/pipelineresources': 'PipelineResources',
  '/pipelineruns': 'PipelineRuns',
  '/pipelines': 'Pipelines',
  '/taskruns': 'TaskRuns',
  '/tasks': 'Tasks'
};

Breadcrumbs.defaultProps = {
  labels: breadcrumbLabels
};
