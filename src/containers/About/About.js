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
import { InlineNotification } from 'carbon-components-react';
import { Table } from '@tektoncd/dashboard-components';
import { getErrorMessage, getTitle } from '@tektoncd/dashboard-utils';

import tektonLogo from '../../images/tekton-stacked-color.svg';

import {
  getDashboardNamespace,
  getDashboardVersion,
  getLogoutURL,
  getPipelineNamespace,
  getPipelineVersion,
  getTriggersNamespace,
  getTriggersVersion,
  isOpenShift,
  isReadOnly,
  isTriggersInstalled
} from '../../reducers';

import './About.scss';

export /* istanbul ignore next */ class About extends Component {
  componentDidMount() {
    const { intl } = this.props;
    document.title = getTitle({
      page: intl.formatMessage({
        id: 'dashboard.about.title',
        defaultMessage: 'About'
      })
    });
  }

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

  checkMissingProperties = () => {
    const { intl } = this.props;
    const propertiesToCheck = {
      DashboardNamespace: this.props.dashboardNamespace,
      DashboardVersion: this.props.dashboardVersion,
      PipelineNamespace: this.props.pipelinesNamespace,
      PipelineVersion: this.props.pipelinesVersion
    };

    const errorsFound = Object.keys(propertiesToCheck)
      .map(key => (propertiesToCheck[key] ? null : key))
      .filter(Boolean);

    return errorsFound.length
      ? intl.formatMessage(
          {
            id: 'dashboard.about.missingProperties',
            defaultMessage: 'Could not find: {errorsFound}'
          },
          { errorsFound: errorsFound.join(', ') }
        )
      : null;
  };

  render() {
    const { intl } = this.props;

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

    const getRow = (property, value) => {
      const displayValue = this.getDisplayValue(value);
      return displayValue
        ? {
            id: property,
            property,
            value: displayValue
          }
        : undefined;
    };

    const error = this.checkMissingProperties();

    const versionLabel = intl.formatMessage({
      id: 'dashboard.about.version',
      defaultMessage: 'Version'
    });
    const isOpenShiftLabel = intl.formatMessage({
      id: 'dashboard.about.isOpenShift',
      defaultMessage: 'IsOpenShift'
    });
    const isReadOnlyLabel = intl.formatMessage({
      id: 'dashboard.about.isReadOnly',
      defaultMessage: 'ReadOnly'
    });
    const logoutURLLabel = intl.formatMessage({
      id: 'dashboard.about.logoutURL',
      defaultMessage: 'LogoutURL'
    });

    return (
      <div className="tkn--about">
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
        <div className="tkn--about--content">
          <div className="tkn--about--tables">
            <Table
              id="tkn--about--dashboard-table"
              headers={headers}
              rows={[
                getRow('Namespace', this.props.dashboardNamespace),
                getRow(versionLabel, this.props.dashboardVersion),
                getRow(isOpenShiftLabel, this.props.isOpenShift),
                getRow(isReadOnlyLabel, this.props.isReadOnly),
                getRow(logoutURLLabel, this.props.logoutURL)
              ].filter(Boolean)}
              size="short"
              title="Dashboard"
            />
            <Table
              headers={headers}
              id="tkn--about--pipelines-table"
              rows={[
                getRow('Namespace', this.props.pipelinesNamespace),
                getRow(versionLabel, this.props.pipelinesVersion)
              ].filter(Boolean)}
              size="short"
              title="Pipelines"
            />
            {this.props.isTriggersInstalled && (
              <Table
                headers={headers}
                id="tkn--about--triggers-table"
                rows={[
                  getRow('Namespace', this.props.triggersNamespace),
                  getRow(versionLabel, this.props.triggersVersion)
                ].filter(Boolean)}
                size="short"
                title="Triggers"
              />
            )}
          </div>
          <div className="tkn--about--image-wrapper">
            <img
              alt={intl.formatMessage({
                id: 'dashboard.logo.alt',
                defaultMessage: 'Tekton logo'
              })}
              role="presentation"
              src={tektonLogo}
              title={intl.formatMessage({
                id: 'dashboard.logo.tooltip',
                defaultMessage: 'Meow'
              })}
            />
          </div>
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = state => ({
  dashboardNamespace: getDashboardNamespace(state),
  dashboardVersion: getDashboardVersion(state),
  isReadOnly: isReadOnly(state),
  isOpenShift: isOpenShift(state),
  logoutURL: getLogoutURL(state),
  pipelinesNamespace: getPipelineNamespace(state),
  pipelinesVersion: getPipelineVersion(state),
  isTriggersInstalled: isTriggersInstalled(state),
  triggersNamespace: getTriggersNamespace(state),
  triggersVersion: getTriggersVersion(state)
});

export const AboutWithIntl = injectIntl(About);
export default connect(mapStateToProps)(AboutWithIntl);
