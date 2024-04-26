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
import { Fragment } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import { CompatRoute, CompatRouter } from 'react-router-dom-v5-compat';
import { render as baseRender } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

function RouterWrapper({ children, path }) {
  return (
    <BrowserRouter>
      <CompatRouter>
        <Switch>
          <CompatRoute path={path}>
            <IntlProvider locale="en" defaultLocale="en" messages={{}}>
              {children}
            </IntlProvider>
          </CompatRoute>
        </Switch>
      </CompatRouter>
    </BrowserRouter>
  );
}

export function renderWithRouter(
  ui,
  {
    path = '/',
    rerender,
    route = '/',
    wrapper: Wrapper = Fragment,
    ...otherOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  return (rerender || baseRender)(ui, {
    route,
    wrapper: ({ children }) => (
      <Wrapper>
        <RouterWrapper path={path}>{children}</RouterWrapper>
      </Wrapper>
    ),
    ...otherOptions
  });
}

function IntlWrapper({ children }) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      {children}
    </IntlProvider>
  );
}

export function render(ui, { rerender, wrapper: Wrapper = Fragment } = {}) {
  return (rerender || baseRender)(ui, {
    wrapper: ({ children }) => (
      <Wrapper>
        <IntlWrapper>{children}</IntlWrapper>
      </Wrapper>
    )
  });
}
