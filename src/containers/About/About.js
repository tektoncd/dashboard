/*
Copyright 2020-2021 The Tekton Authors
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
import { InlineNotification } from 'carbon-components-react';
import { Table } from '@tektoncd/dashboard-components';
import { getErrorMessage, useTitleSync } from '@tektoncd/dashboard-utils';

import { useProperties } from '../../api';

import tektonLogo from '../../images/tekton-dashboard-color.svg';

export function About({ intl }) {
  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.about.title',
      defaultMessage: 'About'
    })
  });

  const getDisplayValue = value => {
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

  const { data, isPlaceholderData } = useProperties();
  const {
    dashboardNamespace,
    dashboardVersion,
    isReadOnly,
    logoutURL,
    pipelinesNamespace,
    pipelinesVersion,
    triggersNamespace,
    triggersVersion
  } = data;

  const isTriggersInstalled = !!(triggersNamespace && triggersVersion);

  const checkMissingProperties = () => {
    if (isPlaceholderData) {
      return null;
    }

    const propertiesToCheck = {
      dashboardNamespace,
      dashboardVersion,
      pipelinesNamespace,
      pipelinesVersion
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
    const displayValue = getDisplayValue(value);
    return (
      displayValue && {
        id: property,
        property,
        value: displayValue
      }
    );
  };

  const error = checkMissingProperties();

  const versionLabel = intl.formatMessage({
    id: 'dashboard.about.version',
    defaultMessage: 'Version'
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
      <h1 id="main-content-header">
        {intl.formatMessage({
          id: 'dashboard.about.title',
          defaultMessage: 'About'
        })}
      </h1>
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
      <div className="tkn--about--content">
        <div className="tkn--about--tables">
          <Table
            id="tkn--about--dashboard-table"
            headers={headers}
            loading={isPlaceholderData}
            rows={[
              getRow('Namespace', dashboardNamespace),
              getRow(versionLabel, dashboardVersion),
              getRow(isReadOnlyLabel, isReadOnly),
              getRow(logoutURLLabel, logoutURL)
            ].filter(Boolean)}
            size="short"
            skeletonRowCount={2}
            title="Dashboard"
          />
          <Table
            headers={headers}
            id="tkn--about--pipelines-table"
            loading={isPlaceholderData}
            rows={[
              getRow('Namespace', pipelinesNamespace),
              getRow(versionLabel, pipelinesVersion)
            ].filter(Boolean)}
            size="short"
            skeletonRowCount={2}
            title="Pipelines"
          />
          {isTriggersInstalled && (
            <Table
              headers={headers}
              id="tkn--about--triggers-table"
              loading={isPlaceholderData}
              rows={[
                getRow('Namespace', triggersNamespace),
                getRow(versionLabel, triggersVersion)
              ].filter(Boolean)}
              size="short"
              skeletonRowCount={2}
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

export default injectIntl(About);
