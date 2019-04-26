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

import React from 'react';

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary', { error, info }); // eslint-disable-line no-console
  }

  render() {
    const { message } = this.props;
    if (this.state.error) {
      return <h1>{message}</h1>;
    }

    return this.props.children;
  }
}

ErrorBoundary.defaultProps = {
  message: 'Something went wrong'
};

export default ErrorBoundary;
