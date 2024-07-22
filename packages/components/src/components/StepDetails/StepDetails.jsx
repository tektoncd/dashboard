/*
Copyright 2019-2024 The Tekton Authors
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
import { getStatus, getStepStatusReason } from '@tektoncd/dashboard-utils';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';

import DetailsHeader from '../DetailsHeader';
import StepDefinition from '../StepDefinition';

const tabs = ['logs', 'details'];

const defaults = {
  onViewChange: /* istanbul ignore next */ () => {},
  taskRun: {}
};

const StepDetails = ({
  definition,
  logContainer,
  onViewChange = defaults.onViewChange,
  stepName,
  stepStatus,
  taskRun = defaults.taskRun,
  view
}) => {
  const intl = useIntl();
  const { exitCode, reason, status } = getStepStatusReason(stepStatus);
  const statusValue =
    getStatus(taskRun).reason === 'TaskRunCancelled' && status !== 'terminated'
      ? 'cancelled'
      : status;

  let selectedTabIndex = tabs.indexOf(view);
  if (selectedTabIndex === -1) {
    selectedTabIndex = 0;
  }

  return (
    <div className="tkn--step-details">
      <DetailsHeader
        displayName={stepName}
        exitCode={exitCode}
        hasWarning={exitCode !== 0}
        reason={reason}
        status={statusValue}
        stepStatus={stepStatus}
        taskRun={taskRun}
      />
      <Tabs
        aria-label="Step details"
        onChange={event => onViewChange(tabs[event.selectedIndex])}
        selectedIndex={selectedTabIndex}
      >
        <TabList activation="manual">
          <Tab>
            {intl.formatMessage({
              id: 'dashboard.taskRun.logs',
              defaultMessage: 'Logs'
            })}
          </Tab>
          <Tab>
            {intl.formatMessage({
              id: 'dashboard.resource.detailsTab',
              defaultMessage: 'Details'
            })}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{selectedTabIndex === 0 && logContainer}</TabPanel>
          <TabPanel>
            {selectedTabIndex === 1 && (
              <StepDefinition definition={definition} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

StepDetails.propTypes = {
  onViewChange: PropTypes.func,
  taskRun: PropTypes.shape({})
};

export default StepDetails;
