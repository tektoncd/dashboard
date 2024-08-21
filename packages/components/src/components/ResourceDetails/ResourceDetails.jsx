/*
Copyright 2020-2024 The Tekton Authors
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

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
  InlineNotification,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag
} from '@carbon/react';
import { formatLabels, getErrorMessage } from '@tektoncd/dashboard-utils';

import FormattedDate from '../FormattedDate';
import ViewYAML from '../ViewYAML';

const tabs = ['overview', 'yaml'];

const defaults = {
  onViewChange: /* istanbul ignore next */ () => {}
};

const ResourceDetails = ({
  actions = null,
  additionalMetadata = null,
  children = null,
  error = null,
  loading,
  onViewChange = defaults.onViewChange,
  resource: originalResource = null,
  view = null
}) => {
  const intl = useIntl();
  if (loading) {
    return <SkeletonText heading width="60%" />;
  }

  if (error || !originalResource) {
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

  const formattedLabels = formatLabels(originalResource.metadata.labels);

  const resource = { ...originalResource };
  if (resource.metadata?.managedFields) {
    delete resource.metadata.managedFields;
  }

  return (
    <div className="tkn--resourcedetails">
      <div className="tkn--resourcedetails--header">
        <h1>{resource.metadata.name}</h1>
        {actions}
      </div>
      <Tabs
        onChange={event => onViewChange(tabs[event.selectedIndex])}
        selectedIndex={selectedTabIndex}
      >
        <TabList
          activation="manual"
          aria-label={intl.formatMessage({
            id: 'dashboard.resourceDetails.ariaLabel',
            defaultMessage: 'Resource details'
          })}
        >
          <Tab>
            {intl.formatMessage({
              id: 'dashboard.resource.overviewTab',
              defaultMessage: 'Overview'
            })}
          </Tab>
          <Tab>YAML</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {selectedTabIndex === 0 && (
              <div className="tkn--details">
                <ul className="tkn--resourcedetails-metadata">
                  {resource.spec?.displayName && (
                    <li>
                      <span>
                        {intl.formatMessage({
                          id: 'dashboard.resourceDetails.spec.displayName',
                          defaultMessage: 'Display name:'
                        })}
                      </span>
                      {resource.spec.displayName}
                    </li>
                  )}
                  {resource.spec?.description && (
                    <li>
                      <span>
                        {intl.formatMessage({
                          id: 'dashboard.resourceDetails.spec.description',
                          defaultMessage: 'Description:'
                        })}
                      </span>
                      {resource.spec.description}
                    </li>
                  )}
                  <li>
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
                  </li>
                  <li>
                    <span>
                      {intl.formatMessage({
                        id: 'dashboard.metadata.labels',
                        defaultMessage: 'Labels:'
                      })}
                    </span>
                    {formattedLabels.length === 0
                      ? intl.formatMessage({
                          id: 'dashboard.metadata.none',
                          defaultMessage: 'None'
                        })
                      : formattedLabels.map(label => (
                          <Tag key={label} size="sm" type="blue">
                            {label}
                          </Tag>
                        ))}
                  </li>
                  {resource.metadata.namespace && (
                    <li>
                      <span>
                        {intl.formatMessage({
                          id: 'dashboard.metadata.namespace',
                          defaultMessage: 'Namespace:'
                        })}
                      </span>
                      {resource.metadata.namespace}
                    </li>
                  )}
                  {additionalMetadata}
                </ul>
                {children}
              </div>
            )}
          </TabPanel>
          <TabPanel>
            {selectedTabIndex === 1 && (
              <ViewYAML enableSyntaxHighlighting resource={resource} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

ResourceDetails.propTypes = {
  actions: PropTypes.node,
  additionalMetadata: PropTypes.node,
  children: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
  onViewChange: PropTypes.func,
  resource: PropTypes.shape({}),
  view: PropTypes.string
};

export default ResourceDetails;
