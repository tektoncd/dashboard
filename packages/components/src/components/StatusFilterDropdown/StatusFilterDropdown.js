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
/* istanbul ignore file */
import React from 'react';
import { injectIntl } from 'react-intl';
import { Dropdown } from 'carbon-components-react';
import { statusFilterOrder } from '@tektoncd/dashboard-utils';

const StatusFilterDropdown = ({
  id,
  initialSelectedStatus,
  intl,
  onChange
}) => {
  const allItem = {
    id: '',
    text: intl.formatMessage({
      id: 'dashboard.filter.all',
      defaultMessage: 'All'
    })
  };

  const statusDisplayNames = {
    running: intl.formatMessage({
      id: 'dashboard.taskRun.status.running',
      defaultMessage: 'Running'
    }),
    pending: intl.formatMessage({
      id: 'dashboard.taskRun.status.pending',
      defaultMessage: 'Pending'
    }),
    failed: intl.formatMessage({
      id: 'dashboard.taskRun.status.failed',
      defaultMessage: 'Failed'
    }),
    cancelled: intl.formatMessage({
      id: 'dashboard.taskRun.status.cancelled',
      defaultMessage: 'Cancelled'
    }),
    completed: intl.formatMessage({
      id: 'dashboard.taskRun.status.succeeded',
      defaultMessage: 'Completed'
    })
  };

  const statusFilterItems = statusFilterOrder.map(status => ({
    id: status,
    text: statusDisplayNames[status]
  }));

  const selectedStatusFilter = initialSelectedStatus
    ? {
        id: initialSelectedStatus,
        text: statusDisplayNames[initialSelectedStatus]
      }
    : allItem;

  return (
    <Dropdown
      id={id}
      initialSelectedItem={selectedStatusFilter}
      items={[allItem, ...statusFilterItems]}
      itemToString={({ text }) => text}
      light
      label={intl.formatMessage({
        id: 'dashboard.taskRun.status',
        defaultMessage: 'Status'
      })}
      onChange={onChange}
      titleText={intl.formatMessage({
        id: 'dashboard.filter.status.title',
        defaultMessage: 'Status:'
      })}
      type="inline"
    />
  );
};

export default injectIntl(StatusFilterDropdown);
