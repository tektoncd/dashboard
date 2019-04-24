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
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Breadcrumb,
  BreadcrumbItem,
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper
} from 'carbon-components-react';

import Header from '../../components/Header';
import {
  getExtensions,
  getExtensionsErrorMessage,
  isFetchingExtensions
} from '../../reducers';

import '../../components/Definitions/Definitions.scss';

export const Extensions = /* istanbul ignore next */ ({
  error,
  loading,
  extensions
}) => {
  return (
    <div className="definitions">
      <Header>
        <div className="definitions-header">
          <Breadcrumb>
            <BreadcrumbItem>
              <NavLink to="/extensions">Extensions</NavLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      </Header>

      <main>
        {(() => {
          if (loading && !extensions.length) {
            return <StructuredListSkeleton border />;
          }

          if (error) {
            return (
              <InlineNotification
                kind="error"
                title="Error loading extensions"
                subtitle={error}
              />
            );
          }

          return (
            <StructuredListWrapper border selection>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Extension</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {extensions.map(({ displayName, name }) => {
                  return (
                    <StructuredListRow className="definition" key={name}>
                      <StructuredListCell>
                        <Link to={`/extensions/${name}`}>{displayName}</Link>
                      </StructuredListCell>
                    </StructuredListRow>
                  );
                })}
              </StructuredListBody>
            </StructuredListWrapper>
          );
        })()}
      </main>
    </div>
  );
};

Extensions.defaultProps = {
  extensions: []
};

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    error: getExtensionsErrorMessage(state),
    loading: isFetchingExtensions(state),
    extensions: getExtensions(state)
  };
}

export default connect(mapStateToProps)(Extensions);
