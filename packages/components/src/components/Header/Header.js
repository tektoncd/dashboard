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

import { Link } from 'react-router-dom';
import { Header as CarbonHeader } from 'carbon-components-react';

import './Header.scss';

import tektonBanner from '../../images/tekton-horizontal-color.png';

export default function Header({ children, logoutButton }) {
  return (
    <CarbonHeader aria-label="Tekton Dashboard" className="header">
      <Link to="/">
        <img
          alt="Tekton logo and title"
          className="banner"
          src={tektonBanner}
        />
      </Link>
      {logoutButton}
      {children && <div className="header-children">{children}</div>}
    </CarbonHeader>
  );
}
