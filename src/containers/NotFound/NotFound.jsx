/*
Copyright 2021-2024 The Tekton Authors
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
import { Link } from 'react-router-dom';
import { Column, Grid, Row } from 'carbon-components-react';
import { Link as CustomLink } from '@tektoncd/dashboard-components';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { useSelectedNamespace } from '../../api';
import robocat from '../../images/robocat_404.svg';

const smallConfig = { offset: 1, span: 2 };
const mediumConfig = { offset: 2, span: 4 };
const largeConfig = { offset: 5, span: 6 };

function NotFound({ suggestions = [] }) {
  const intl = useIntl();
  const { selectedNamespace: namespace } = useSelectedNamespace();

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
            {suggestions.map(({ text, to }) => (
              <li key={text}>
                <Link component={CustomLink} to={to}>
                  {text}
                </Link>
              </li>
            ))}
            <li>
              <Link component={CustomLink} to="/">
                {intl.formatMessage({
                  id: 'dashboard.home.title',
                  defaultMessage: 'Home'
                })}
              </Link>
            </li>
            {suggestions.length === 0 ? (
              <>
                <li>
                  <Link
                    component={CustomLink}
                    to={
                      namespace !== ALL_NAMESPACES
                        ? urls.pipelineRuns.byNamespace({ namespace })
                        : urls.pipelineRuns.all()
                    }
                  >
                    PipelineRuns
                  </Link>
                </li>
                <li>
                  <Link
                    component={CustomLink}
                    to={
                      namespace !== ALL_NAMESPACES
                        ? urls.taskRuns.byNamespace({ namespace })
                        : urls.taskRuns.all()
                    }
                  >
                    TaskRuns
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </Column>
      </Row>
    </Grid>
  );
}

export default NotFound;
