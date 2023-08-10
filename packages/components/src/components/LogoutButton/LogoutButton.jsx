/*
Copyright 2019-2021 The Tekton Authors
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

import { Logout20 as LogoutIcon } from '@carbon/icons-react';
import { HeaderGlobalAction } from 'carbon-components-react';
import { injectIntl } from 'react-intl';
import React, { Component } from 'react';

export class LogoutButton extends Component {
  state = {
    logoutURL: null
  };

  componentDidMount() {
    this.determineLogoutURL();
  }

  /* istanbul ignore next */
  handleLogout = () => {
    const { logoutURL } = this.state;
    window.location.href = logoutURL;
  };

  async determineLogoutURL() {
    try {
      const logoutURL = await this.props.getLogoutURL();
      this.setState({ logoutURL });
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
    }
  }

  render() {
    const { logoutURL } = this.state;
    if (!logoutURL) {
      return null;
    }

    const logoutString = this.props.intl.formatMessage({
      id: 'dashboard.header.logOut',
      defaultMessage: 'Log out'
    });

    return (
      <HeaderGlobalAction
        aria-label={logoutString}
        className="tkn--logout-btn"
        onClick={this.handleLogout}
        title={logoutString}
      >
        <LogoutIcon />
      </HeaderGlobalAction>
    );
  }
}

export default injectIntl(LogoutButton);
