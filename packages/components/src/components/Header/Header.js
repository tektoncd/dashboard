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
import { injectIntl } from 'react-intl';

import {
  Header as CarbonHeader,
  HeaderGlobalBar,
  HeaderName
} from 'carbon-components-react';

import './Header.scss';

import tektonLogo from '../../images/tekton-logo-20x20.svg';

function Header({ intl, logoutButton }) {
  return (
    <CarbonHeader aria-label="Tekton Dashboard" className="tkn--header">
      <span className="tkn--logo">
        <img
          alt={intl.formatMessage({
            id: 'dashboard.logo.alt',
            defaultMessage: 'Tekton logo'
          })}
          src={tektonLogo}
          title={intl.formatMessage({
            id: 'dashboard.logo.tooltip',
            defaultMessage: 'Meow'
          })}
        />
      </span>
      <HeaderName href="/" prefix="">
        Tekton
      </HeaderName>
      <HeaderGlobalBar>{logoutButton}</HeaderGlobalBar>
    </CarbonHeader>
  );
}

export default injectIntl(Header);
