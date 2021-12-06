/*
Copyright 2021 The Tekton Authors
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
import { Link } from 'react-router-dom';
import { Link as CarbonLink, Column, Grid, Row } from 'carbon-components-react';
import { urls } from '@tektoncd/dashboard-utils';

import robocat from '../../images/robocat_404.svg';

const smallConfig = { offset: 1, span: 2 };
const mediumConfig = { offset: 2, span: 4 };
const largeConfig = { offset: 5, span: 6 };

function NotFound({ intl }) {
  return (
    <Grid className="tkn--not-found">
      <Row narrow>
        <Column sm={smallConfig} md={mediumConfig} lg={largeConfig}>
          <img
            alt={intl.formatMessage({
              id: 'dashboard.logo.alt',
              defaultMessage: 'Tekton logo'
            })}
            role="presentation"
            src={robocat}
            title={intl.formatMessage({
              id: 'dashboard.logo.tooltip',
              defaultMessage: 'Meow'
            })}
          />
        </Column>
      </Row>
      <Row>
        <Column sm={smallConfig} md={mediumConfig} lg={largeConfig}>
          <h1>
            {intl.formatMessage({
              id: 'dashboard.notFound.title',
              defaultMessage: 'Oops… Page not found'
            })}
          </h1>
          <p>
            {intl.formatMessage({
              id: 'dashboard.notFound.description',
              defaultMessage:
                'We couldn’t find the page you were looking for, but here are some helpful links instead:'
            })}
          </p>

          <ul>
            <li>
              <Link component={CarbonLink} to="/">
                {intl.formatMessage({
                  id: 'dashboard.home.title',
                  defaultMessage: 'Home'
                })}
              </Link>
            </li>
            <li>
              <Link component={CarbonLink} to={urls.pipelineRuns.all()}>
                PipelineRuns
              </Link>
            </li>
            <li>
              <Link component={CarbonLink} to={urls.taskRuns.all()}>
                TaskRuns
              </Link>
            </li>
          </ul>
        </Column>
      </Row>
    </Grid>
  );
}

export default injectIntl(NotFound);
