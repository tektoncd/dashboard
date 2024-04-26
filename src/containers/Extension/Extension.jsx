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
/* istanbul ignore file */

import { lazy, Suspense, useState } from 'react';
import { useIntl } from 'react-intl';
import { ErrorBoundary } from '@tektoncd/dashboard-components';
import { paths, urls, useTitleSync } from '@tektoncd/dashboard-utils';

// TODO: restore this when adding support for custom UI extensions
// import './globals';

function Extension({ displayName: resourceName, source }) {
  const intl = useIntl();
  const [ExtensionComponent] = useState(() =>
    lazy(() => import(/* @vite-ignore */ source))
  );

  useTitleSync({
    page: 'Extension',
    resourceName
  });

  return (
    <ErrorBoundary
      message={intl.formatMessage({
        id: 'dashboard.extension.error',
        defaultMessage: 'Error loading extension'
      })}
    >
      <Suspense
        fallback={
          <div>
            {intl.formatMessage({
              id: 'dashboard.loading',
              defaultMessage: 'Loading…'
            })}
          </div>
        }
      >
        <ExtensionComponent utils={{ paths, urls }} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default Extension;
