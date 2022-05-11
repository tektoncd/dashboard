/*
Copyright 2020-2022 The Tekton Authors
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

import React, { Fragment } from 'react';
import { injectIntl } from 'react-intl';
import {
  ClickableTile as CarbonClickableTile,
  InlineNotification,
  SkeletonText,
  Tile
} from 'carbon-components-react';
import { ArrowRight24 as ArrowIcon } from '@carbon/icons-react';
import { getErrorMessage, useTitleSync } from '@tektoncd/dashboard-utils';

import { useProperties } from '../../api';

import tektonLogo from '../../images/tekton-dashboard-color.svg';
import { ReactComponent as DocsPictogram } from '../../images/assets.svg';
import { ReactComponent as HubPictogram } from '../../images/user--interface.svg';

function ClickableTile(props) {
  return (
    <CarbonClickableTile
      className="tkn--tile--docs"
      rel="noopener"
      target="_blank"
      {...props}
    />
  );
}

export function About({ intl }) {
  useTitleSync({
    page: intl.formatMessage({
      id: 'dashboard.about.title',
      defaultMessage: 'About Tekton'
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

  const getField = (property, value) => {
    const displayValue = getDisplayValue(value);
    return (
      displayValue && (
        <Fragment key={property}>
          <dt className="bx--label">{property}</dt>
          <dd>{displayValue}</dd>
        </Fragment>
      )
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
      <div className="tkn--css-grid tkn--about-header">
        <header>
          <h1 id="main-content-header">
            {intl.formatMessage({
              id: 'dashboard.about.title',
              defaultMessage: 'About Tekton'
            })}
          </h1>
          <p>
            {intl.formatMessage({
              id: 'dashboard.about.description',
              defaultMessage:
                'Tekton is a powerful and flexible open-source framework for creating CI/CD systems, allowing developers to build, test, and deploy across cloud providers and on-premises systems.'
            })}
          </p>
        </header>
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

      <section className="tkn--css-grid">
        <header>
          <h2 className="tkn--section-title">
            {intl.formatMessage({
              id: 'dashboard.about.environmentDetails',
              defaultMessage: 'Environment details'
            })}
          </h2>
        </header>
        <Tile id="tkn--about--dashboard-tile">
          <h3>Dashboard</h3>
          {isPlaceholderData ? (
            <SkeletonText paragraph />
          ) : (
            <dl>
              {[
                getField(isReadOnlyLabel, isReadOnly),
                getField(logoutURLLabel, logoutURL),
                getField('Namespace', dashboardNamespace),
                getField(versionLabel, dashboardVersion)
              ].filter(Boolean)}
            </dl>
          )}
        </Tile>
        <Tile id="tkn--about--pipelines-tile">
          <h3>Pipelines</h3>
          {isPlaceholderData ? (
            <SkeletonText paragraph />
          ) : (
            <dl>
              {[
                getField('Namespace', pipelinesNamespace),
                getField(versionLabel, pipelinesVersion)
              ].filter(Boolean)}
            </dl>
          )}
        </Tile>
        {isTriggersInstalled && (
          <Tile id="tkn--about--triggers-tile">
            <h3>Triggers</h3>
            {isPlaceholderData ? (
              <SkeletonText paragraph />
            ) : (
              <dl>
                {[
                  getField('Namespace', triggersNamespace),
                  getField(versionLabel, triggersVersion)
                ].filter(Boolean)}
              </dl>
            )}
          </Tile>
        )}
      </section>

      <section className="tkn--about-docs tkn--css-grid">
        <header>
          <h2 className="tkn--section-title">
            {intl.formatMessage({
              id: 'dashboard.about.documentation',
              defaultMessage: 'Documentation and resources'
            })}
          </h2>
        </header>
        <ClickableTile href="https://tekton.dev/docs/concepts/overview/">
          <div className="tkn--about-pictogram">
            <DocsPictogram />
          </div>
          <div className="tkn--about-docs-description">
            <h3>Overview of Tekton</h3>
            <p>Components, benefits and caveats, common usage</p>
            <ArrowIcon className="tkn--about-arrow" />
          </div>
        </ClickableTile>
        <ClickableTile href="https://tekton.dev/docs/concepts/concept-model/">
          <div className="tkn--about-pictogram">
            <DocsPictogram />
          </div>
          <div className="tkn--about-docs-description">
            <h3>Concept model</h3>
            <p>Basic Tekton components and data model</p>
            <ArrowIcon className="tkn--about-arrow" />
          </div>
        </ClickableTile>
        <ClickableTile href="https://tekton.dev/docs/pipelines/">
          <div className="tkn--about-pictogram">
            <DocsPictogram />
          </div>
          <div className="tkn--about-docs-description">
            <h3>Tasks and Pipelines</h3>
            <p>Building blocks of Tekton CI/CD workflow</p>
            <ArrowIcon className="tkn--about-arrow" />
          </div>
        </ClickableTile>
        <ClickableTile href="https://hub.tekton.dev/">
          <div className="tkn--about-pictogram">
            <HubPictogram />
          </div>
          <div className="tkn--about-docs-description">
            <h3>Tekton Hub</h3>
            <p>Discover, search, and share reusable Tasks and Pipelines</p>
            <ArrowIcon className="tkn--about-arrow" />
          </div>
        </ClickableTile>
      </section>
    </div>
  );
}

export default injectIntl(About);
