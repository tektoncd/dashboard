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
  const pathSegments = url
    .split('/')
    .filter(segment => !!segment && segment !== 'runs');

  return (
    <Breadcrumb>
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        return (
          <BreadcrumbItem key={segment}>
            <NavLink exact to={path}>
              {labels[path] || segment}
            </NavLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}

const breadcrumbLabels = {
  '/pipelines': 'Pipelines',
  '/tasks': 'Tasks',
  '/extensions': 'Extensions',
  '/importresources': 'Import Tekton Resources'
};

Breadcrumbs.defaultProps = {
  labels: breadcrumbLabels
};
