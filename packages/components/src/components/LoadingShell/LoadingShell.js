/*
Copyright 2020-2021 The Tekton Authors
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
import { injectIntl } from 'react-intl';
import {
  SkeletonText as CarbonSkeletonText,
  Content,
  Loading,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu
} from 'carbon-components-react';
import { Header } from '..';

const SkeletonText = ({ heading, paragraph }) => (
  <CarbonSkeletonText heading={heading} paragraph={paragraph} width="80%" />
);

const LoadingShell = ({ intl }) => {
  const loadingMessage = intl.formatMessage({
    id: 'dashboard.loading.config',
    defaultMessage: 'Loading configuration…'
  });

  return (
    <div className="tkn--config-loading-shell">
      <Header />
      <SideNav
        isFixedNav
        expanded
        isChildOfHeader={false}
        aria-label="Main navigation"
        className="tkn--config-loading-nav-skeleton"
      >
        <SideNavItems>
          <SideNavMenu
            defaultExpanded
            title={intl.formatMessage({
              id: 'dashboard.sideNav.tektonResources',
              defaultMessage: 'Tekton resources'
            })}
          >
            <li>
              <SkeletonText paragraph />
            </li>
          </SideNavMenu>

          <SkeletonText heading />
          <SkeletonText paragraph />

          <SideNavLink icon={<span />}>
            {intl.formatMessage({
              id: 'dashboard.about.title',
              defaultMessage: 'About'
            })}
          </SideNavLink>

          <SideNavLink icon={<span />}>
            {intl.formatMessage({
              id: 'dashboard.settings.title',
              defaultMessage: 'Settings'
            })}
          </SideNavLink>
        </SideNavItems>
      </SideNav>
      <Content>
        <div className="bx--loading-overlay tkn--config-loading-overlay">
          <Loading description={loadingMessage} withOverlay={false} />
          <span className="tkn--config-loading-text">{loadingMessage}</span>
        </div>
      </Content>
    </div>
  );
};

export default injectIntl(LoadingShell);
