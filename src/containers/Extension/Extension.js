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

import React, { Component, Suspense } from 'react';
import { NavLink } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';

import Header from '../../components/Header';
import ErrorBoundary from '../../components/ErrorBoundary';

import './globals';

export default /* istanbul ignore next */ class Extension extends Component {
  constructor(props) {
    super(props);

    const { source } = props;
    const ExtensionComponent = React.lazy(() =>
      import(/* webpackIgnore: true */ source)
    );

    this.state = { ExtensionComponent };
  }

  render() {
    const { displayName, match } = this.props;
    const { ExtensionComponent } = this.state;

    return (
      <div className="pipelines">
        <Header>
          <div className="pipelines-header">
            <Breadcrumb>
              <BreadcrumbItem>
                <NavLink to={match.url}>{displayName}</NavLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        </Header>
        <main>
          <ErrorBoundary message="Error loading extension">
            <Suspense fallback={<div>Loading...</div>}>
              <ExtensionComponent />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    );
  }
}
