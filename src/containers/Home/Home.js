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
import { connect } from 'react-redux';
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
import { getExtensions } from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export const Home = /* istanbul ignore next */ ({ extensions }) => {
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
            {!!extensions.length && (
              <StructuredListRow className="pipeline">
                <StructuredListCell>
                  <Link to="/extensions">Extensions</Link>
                </StructuredListCell>
              </StructuredListRow>
            )}
          </StructuredListBody>
        </StructuredListWrapper>
      </main>
    </div>
  );
};

const mapStateToProps = state => ({
  extensions: getExtensions(state)
});

export default connect(mapStateToProps)(Home);
