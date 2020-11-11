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

import React from 'react';
import { IntlProvider } from 'react-intl';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';

import messages from '../src/nls/messages_en.json';

import './Container.scss';

const history = createMemoryHistory({ initialEntries: ['/'] });

export default function Container({ story, notes }) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={messages['en']}>
      {notes && <p>{notes}</p>}
      <div data-floating-menu-container role="main">
        <Router history={history}>
          <Route path="/" component={() => story()} />
        </Router>
      </div>
    </IntlProvider>
  );
}
