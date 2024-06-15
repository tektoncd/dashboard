/*
Copyright 2024 The Tekton Authors
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

import { useIntl } from 'react-intl';
import { useRouteError } from 'react-router-dom';
import { Column, Grid, Row } from 'carbon-components-react';

import robocat from '../../images/robocat_404.svg';

const smallConfig = { offset: 1, span: 2 };
const mediumConfig = { offset: 2, span: 4 };
const largeConfig = { offset: 5, span: 6 };

function ErrorPage() {
  const intl = useIntl();

  const error = useRouteError();
  console.error(error); // eslint-disable-line no-console

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
              id: 'dashboard.errorPage.title',
              defaultMessage: 'Oops… Something went wrong'
            })}
          </h1>
          <p>
            {intl.formatMessage({
              id: 'dashboard.errorPage.description',
              defaultMessage:
                'An error occurred loading the page, please try again. If the error persists, contact an admin.'
            })}
          </p>

          <p>
            {intl.formatMessage(
              {
                id: 'dashboard.errorPage.errorMessage',
                defaultMessage: 'Error message: {errorMessage}'
              },
              { errorMessage: error.message }
            )}
          </p>
        </Column>
      </Row>
    </Grid>
  );
}

export default ErrorPage;
