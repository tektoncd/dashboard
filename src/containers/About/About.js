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

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { InlineNotification } from 'carbon-components-react';
import { Table } from '@tektoncd/dashboard-components';
import { getErrorMessage } from '@tektoncd/dashboard-utils';

import { getInstallProperties } from '../../api';

const initialState = {
  dashboardInfo: null,
  error: null,
  loading: true
};

const propertiesToCheck = [
  'InstallNamespace',
  'DashboardVersion',
  'PipelineVersion',
  'IsOpenShift'
];

export /* istanbul ignore next */ class About extends Component {
  state = initialState;

  componentDidMount() {
    this.fetchDashboardInfo();
  }

  checkMissingProperties = () => {
    const { intl } = this.props;
    const { dashboardInfo } = this.state;
    const errorsFound = propertiesToCheck
      .map(property =>
        dashboardInfo[property] || dashboardInfo[property] === false
          ? null
          : property
      )
      .filter(Boolean);

    if (!errorsFound.length) {
      return;
    }

    const error = intl.formatMessage(
      {
        id: 'dashboard.about.missingProperties',
        defaultMessage: `Could not find: {errorsFound}`
      },
      { errorsFound: errorsFound.join(', ') }
    );

    this.setState({ error });
  };

  getDisplayValue = value => {
    const { intl } = this.props;

    switch (value) {
      case true:
        return intl.formatMessage({
          id: 'dashboard.about.true',
          defaultMessage: 'True'
        });
      default:
        return value;
    }
  };

  async fetchDashboardInfo() {
    try {
      const dashboardInfo = await getInstallProperties();
      this.setState(
        {
          dashboardInfo,
          loading: false
        },
        this.checkMissingProperties
      );
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { intl } = this.props;
    const { dashboardInfo, error, loading } = this.state;
    const headers = [
      {
        key: 'property',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.property',
          defaultMessage: 'Property'
        })
      },
      {
        key: 'value',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.value',
          defaultMessage: 'Value'
        })
      }
    ];

    const rows = [];
    if (dashboardInfo && !loading) {
      propertiesToCheck.forEach(property => {
        const value = this.getDisplayValue(dashboardInfo[property]);
        if (value) {
          rows.push({
            id: property,
            property,
            value
          });
        }
      });
    }

    return (
      <>
        {error && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.about.error',
              defaultMessage: 'Error getting data'
            })}
            subtitle={getErrorMessage(error)}
            lowContrast
          />
        )}
        <h1>
          {intl.formatMessage({
            id: 'dashboard.about.title',
            defaultMessage: 'About'
          })}
        </h1>
        <Table headers={headers} rows={rows} loading={loading} />
      </>
    );
  }
}

export default injectIntl(About);
