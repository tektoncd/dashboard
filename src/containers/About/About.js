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
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Table } from '@tektoncd/dashboard-components';
import { InlineNotification } from 'carbon-components-react';
import { getInstallProperties } from '../../api';
import { isWebSocketConnected } from '../../reducers';

const initialState = {
  dashboardInfo: {},
  isLoaded: false,
  isNotFinished: true,
  error: ''
};

export /* istanbul ignore next */ class About extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.fetchDashboardInfo();
  }

  setErrorState(errorsFound, intl) {
    const errorsFoundList = intl.formatMessage(
      {
        id: 'dashboard.error.error',
        defaultMessage: `{errorsFound} cannot be found`
      },
      { errorsFound }
    );

    if (this.state.isNotFinished) {
      this.setState({
        error: errorsFoundList,
        isNotFinished: false
      });
    }
  }

  async fetchDashboardInfo() {
    const dash = await getInstallProperties();
    this.setState({
      dashboardInfo: dash,
      isLoaded: true
    });
  }

  makeLines(property) {
    let data = '';
    let value = this.state.dashboardInfo[property];
    if (this.state.dashboardInfo[property] !== undefined) {
      if (value === false) {
        value = 'False';
      }
      if (value === true) {
        value = 'True';
      }
      data = {
        id: property,
        property,
        value
      };
    }
    return data;
  }

  render() {
    const { intl, loading } = this.props;
    const initialHeaders = [
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
    const initialRows = [];
    if (this.state.dashboardInfo !== '' && this.state.isLoaded === true) {
      const errorsToDisplay = [];
      const propertiesToCheck = [
        'InstallNamespace',
        'DashboardVersion',
        'PipelineVersion',
        'IsOpenshift'
      ];
      propertiesToCheck.forEach(element => {
        const line = this.makeLines(element);
        if (line.value !== undefined && line.value !== '') {
          initialRows.push(line);
        } else {
          errorsToDisplay.push(element);
        }
      });

      if (errorsToDisplay.length !== 0) {
        this.setErrorState(errorsToDisplay, intl);
      }

      return (
        <>
          {this.state.error !== '' && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.displayVersion.error',
                defaultMessage: 'Error getting data'
              })}
              subtitle={this.state.error}
              lowContrast
            />
          )}
          <h1>
            {intl.formatMessage({
              id: 'dashboard.about.title',
              defaultMessage: 'About'
            })}
          </h1>
          <Table
            headers={initialHeaders}
            rows={initialRows}
            loading={loading}
          />
        </>
      );
    }

    return (
      <>
        <h1>
          {intl.formatMessage({
            id: 'dashboard.about.title',
            defaultMessage: 'About'
          })}
        </h1>
        <Table headers={initialHeaders} rows={initialRows} loading={loading} />
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    webSocketConnected: isWebSocketConnected(state)
  };
}

export default connect(mapStateToProps)(injectIntl(About));
