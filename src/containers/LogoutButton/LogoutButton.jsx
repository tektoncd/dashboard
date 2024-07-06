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

import { Logout as LogoutIcon } from '@carbon/react/icons';
import { HeaderGlobalAction } from '@carbon/react';
import { useIntl } from 'react-intl';
import { useLogoutURL } from '../../api';

export default function LogoutButton() {
  const intl = useIntl();
  const logoutURL = useLogoutURL();

  if (!logoutURL) {
    return null;
  }

  const logoutString = intl.formatMessage({
    id: 'dashboard.header.logOut',
    defaultMessage: 'Log out'
  });

  return (
    <HeaderGlobalAction
      aria-label={logoutString}
      className="tkn--logout-btn"
      onClick={() => {
        window.location.href = logoutURL;
      }}
      title={logoutString}
    >
      <LogoutIcon size={20} />
    </HeaderGlobalAction>
  );
}
