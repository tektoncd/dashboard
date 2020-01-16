/*
Copyright 2019-2020 The Tekton Authors
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
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from 'react-testing-library';
import { IntlProvider } from 'react-intl';

export function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    container
  } = {}
) {
  return {
    ...render(
      <Router history={history}>
        <IntlProvider locale="en" defaultLocale="en" messages={{}}>
          {ui}
        </IntlProvider>
      </Router>,
      {
        container
      }
    ),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history
  };
}

export function wrapWithIntl(ui) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      {ui}
    </IntlProvider>
  );
}

export function renderWithIntl(ui) {
  return {
    ...render(wrapWithIntl(ui))
  };
}

export function rerenderWithIntl(rerender, ui) {
  return {
    ...rerender(wrapWithIntl(ui))
  };
}
