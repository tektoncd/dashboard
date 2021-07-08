/*
Copyright 2020 The Tekton Authors
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
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { InlineNotification, SkeletonText, Tag } from 'carbon-components-react';
import { formatLabels, getErrorMessage } from '@tektoncd/dashboard-utils';
import {
  FormattedDate,
  Tab,
  Tabs,
  ViewYAML
} from '@tektoncd/dashboard-components';

const tabs = ['overview', 'yaml'];

const ResourceDetails = ({
  additionalMetadata,
  children,
  error,
  intl,
  loading,
  onViewChange,
  resource,
  view
}) => {
  if (loading) {
    return <SkeletonText heading width="60%" />;
  }

  if (error || !resource) {
    return (
      <InlineNotification
        kind="error"
        hideCloseButton
        lowContrast
        title={intl.formatMessage({
          id: 'dashboard.resourceDetails.errorloading',
          defaultMessage: 'Error loading resource'
        })}
        subtitle={getErrorMessage(error)}
      />
    );
  }

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  let formattedLabelsToRender = [];
  if (resource.metadata.labels) {
    formattedLabelsToRender = formatLabels(resource.metadata.labels);
  }

  return (
    <div className="tkn--resourcedetails">
      <h1>{resource.metadata.name}</h1>
      <Tabs
        aria-label={intl.formatMessage({
          id: 'dashboard.resourceDetails.ariaLabel',
          defaultMessage: 'Resource details'
        })}
        onSelectionChange={index => onViewChange(tabs[index])}
        selected={selectedTabIndex}
      >
        <Tab
          label={intl.formatMessage({
            id: 'dashboard.resource.overviewTab',
            defaultMessage: 'Overview'
          })}
        >
          <div className="tkn--details">
            <div className="tkn--resourcedetails-metadata">
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.dateCreated',
                    defaultMessage: 'Date created:'
                  })}
                </span>
                <FormattedDate
                  date={resource.metadata.creationTimestamp}
                  relative
                />
              </p>
              <p>
                <span>
                  {intl.formatMessage({
                    id: 'dashboard.metadata.labels',
                    defaultMessage: 'Labels:'
                  })}
                </span>
                {formattedLabelsToRender.length === 0
                  ? intl.formatMessage({
                      id: 'dashboard.metadata.none',
                      defaultMessage: 'None'
                    })
                  : formattedLabelsToRender.map(label => (
                      <Tag key={label} size="sm" type="blue">
                        {label}
                      </Tag>
                    ))}
              </p>
              {resource.metadata.namespace && (
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.metadata.namespace',
                      defaultMessage: 'Namespace:'
                    })}
                  </span>
                  {resource.metadata.namespace}
                </p>
              )}
              {resource.spec?.description && (
                <p>
                  <span>
                    {intl.formatMessage({
                      id: 'dashboard.resourceDetails.description',
                      defaultMessage: 'Description'
                    })}
                  </span>
                  {resource.spec.description}
                </p>
              )}
              {additionalMetadata}
            </div>
            {children}
          </div>
        </Tab>
        <Tab label="YAML">
          <ViewYAML resource={resource} dark />
        </Tab>
      </Tabs>
    </div>
  );
};

ResourceDetails.defaultProps = {
  additionalMetadata: null,
  children: null,
  error: null,
  onViewChange: /* istanbul ignore next */ () => {},
  resource: null,
  view: null
};

ResourceDetails.propTypes = {
  additionalMetadata: PropTypes.node,
  children: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
  onViewChange: PropTypes.func,
  resource: PropTypes.shape({}),
  view: PropTypes.string
};

export default injectIntl(ResourceDetails);
