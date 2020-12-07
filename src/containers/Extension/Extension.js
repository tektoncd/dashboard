/*
Copyright 2019 The Tekton Authors
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

import React, { Component, Suspense } from 'react';
import { injectIntl } from 'react-intl';
import { ErrorBoundary } from '@tektoncd/dashboard-components';
import { getTitle, paths, urls } from '@tektoncd/dashboard-utils';

import * as actions from './actions';
import * as selectors from '../../reducers';
import './globals';

/* istanbul ignore next */ class Extension extends Component {
  constructor(props) {
    super(props);

    const { source } = props;
    const ExtensionComponent = React.lazy(() =>
      import(/* webpackIgnore: true */ source)
    );

    this.state = { ExtensionComponent };
  }

  componentDidMount() {
    const { displayName: resourceName } = this.props;
    document.title = getTitle({
      page: 'Extension',
      resourceName
    });
  }

  render() {
    const { intl } = this.props;
    const { ExtensionComponent } = this.state;

    return (
      <ErrorBoundary
        message={intl.formatMessage({
          id: 'dashboard.extension.error',
          defaultMessage: 'Error loading extension'
        })}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ExtensionComponent
            actions={actions}
            selectors={selectors}
            utils={{ paths, urls }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }
}

export default injectIntl(Extension);
