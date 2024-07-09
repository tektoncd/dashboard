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

import { useIntl } from 'react-intl';
import {
  Header as CarbonHeader,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  SkipToContent,
  Theme
} from '@carbon/react';

import { SideNav } from '..';

/* istanbul ignore next */
function skipToContentClick(event) {
  event.preventDefault();
  window.scrollTo(0, 0);
  document.getElementById('main-content').focus();
}

function Header({
  children,
  headerNameProps,
  isSideNavExpanded,
  onHeaderMenuButtonClick
}) {
  const intl = useIntl();
  return (
    <Theme
      aria-label="Tekton Dashboard"
      as={CarbonHeader}
      className="tkn--header"
      theme="g100"
    >
      <SkipToContent href="#" onClick={skipToContentClick}>
        {intl.formatMessage({
          id: 'dashboard.skipToContent',
          defaultMessage: 'Skip to main content'
        })}
      </SkipToContent>
      {onHeaderMenuButtonClick && (
        <HeaderMenuButton
          aria-label={
            isSideNavExpanded
              ? intl.formatMessage({
                  id: 'dashboard.header.closeNavMenu',
                  defaultMessage: 'Close menu'
                })
              : intl.formatMessage({
                  id: 'dashboard.header.openNavMenu',
                  defaultMessage: 'Open menu'
                })
          }
          isActive={isSideNavExpanded}
          isCollapsible
          onClick={onHeaderMenuButtonClick}
        />
      )}
      <HeaderName prefix="Tekton" {...headerNameProps}>
        Dashboard
      </HeaderName>
      <HeaderGlobalBar>{children}</HeaderGlobalBar>
      <SideNav expanded={isSideNavExpanded} />
    </Theme>
  );
}

export default Header;
