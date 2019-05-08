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

import ErrorBoundary from '../../components/ErrorBoundary';

import * as selectors from '../../reducers';
import './globals';

/* istanbul ignore next */
function dynamicImport(source, name) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const moduleId = `__tektonDashboardExtension_${name}`;

    const cleanup = () => {
      script.remove();
      URL.revokeObjectURL(script.src);
      delete window[moduleId];
    };

    script.type = 'module';
    script.onerror = () => {
      reject(new Error(`Failed to import ${source}`));
      cleanup();
    };

    script.onload = () => {
      resolve({ default: window[moduleId] });
      cleanup();
    };

    const loaderModule = `import extension from '${source}'; window['${moduleId}'] = extension;`;
    const loaderBlob = new Blob([loaderModule], { type: 'text/javascript' });
    script.src = URL.createObjectURL(loaderBlob);

    document.head.appendChild(script);
  });
}

export default /* istanbul ignore next */ class Extension extends Component {
  constructor(props) {
    super(props);

    const { name, source } = props;
    const ExtensionComponent = React.lazy(() => {
      try {
        return new Function(`return import("${source}")`)(); // eslint-disable-line no-new-func
      } catch (e) {
        console.warn('dynamic module import not supported, trying fallback'); // eslint-disable-line no-console
        return dynamicImport(source, name);
      }
    });

    this.state = { ExtensionComponent };
  }

  render() {
    const { ExtensionComponent } = this.state;

    return (
      <ErrorBoundary message="Error loading extension">
        <Suspense fallback={<div>Loading...</div>}>
          <ExtensionComponent selectors={selectors} />
        </Suspense>
      </ErrorBoundary>
    );
  }
}
