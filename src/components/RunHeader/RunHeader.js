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

import React, { Component } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  SkeletonPlaceholder,
  Tab,
  Tabs
} from 'carbon-components-react';
import { Link } from 'react-router-dom';

import Header from '../Header';
import { getStatusIcon } from '../../utils';

import './RunHeader.scss';

class RunHeader extends Component {
  render() {
    const {
      error,
      lastTransitionTime,
      loading,
      name,
      runName,
      reason,
      status,
      type,
      typeLabel
    } = this.props;

    return (
      <Header>
        <div
          className="pipeline-run-header"
          data-succeeded={status}
          data-reason={reason}
        >
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={`/${type}`}>{typeLabel}</Link>
            </BreadcrumbItem>
            {name && (
              <BreadcrumbItem>
                <Link to={`/${type}/${name}`}>{name}</Link>
              </BreadcrumbItem>
            )}
          </Breadcrumb>

          {(() => {
            if (error) {
              return <h1>{error}</h1>;
            }
            if (loading) {
              return <SkeletonPlaceholder className="header-skeleton" />;
            }
            return (
              runName && (
                <h1>
                  <div className="block-icon">
                    {getStatusIcon({ reason, status })}
                  </div>
                  {runName}
                  <span className="status-label">{reason}</span>
                  <span className="time">{lastTransitionTime}</span>
                </h1>
              )
            );
          })()}
          {/*
            TODO: move this out to PipelineRun as sibling of the header.
            Tab should contain TaskTree, StepDetails, etc.
          */}
          <Tabs>
            <Tab label="Tasks" />
          </Tabs>
        </div>
      </Header>
    );
  }
}

export default RunHeader;
