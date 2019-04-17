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
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper
} from 'carbon-components-react';

import Header from '../../components/Header';

import '../../components/Definitions/Definitions.scss';

/* istanbul ignore next */
const Home = () => {
  return (
    <div className="definitions">
      <Header>
        <div className="definitions-header">
          <Breadcrumb>
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </Header>

      <main>
        <StructuredListWrapper border selection>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>Task</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            <StructuredListRow className="pipeline">
              <StructuredListCell>
                <Link to="/pipelines">Pipelines</Link>
              </StructuredListCell>
            </StructuredListRow>
            <StructuredListRow className="pipeline">
              <StructuredListCell>
                <Link to="/tasks">Tasks</Link>
              </StructuredListCell>
            </StructuredListRow>
          </StructuredListBody>
        </StructuredListWrapper>
      </main>
    </div>
  );
};

export default Home;
