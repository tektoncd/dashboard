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

import { Logout20 as LogoutIcon } from '@carbon/icons-react';
import { HeaderGlobalAction } from 'carbon-components-react';
import { injectIntl } from 'react-intl';
import React, { Component } from 'react';
import './LogoutButton.scss';

/* istanbul ignore next */
function handleLogout() {
  window.location.href = '/oauth/sign_out';
}

export class LogoutButton extends Component {
  state = {
    showLogout: false
  };

  componentDidMount() {
    this.determineOpenShift();
  }

  async determineOpenShift() {
    try {
      const showLogout = await this.props.shouldDisplayLogout();
      this.setState({ showLogout });
    } catch (error) {} // eslint-disable-line
  }

  render() {
    if (!this.state.showLogout) {
      return null;
    }
    return (
      <HeaderGlobalAction
        data-testid="logout-btn"
        className="tkn--logout-btn"
        onClick={handleLogout}
        title={this.props.intl.formatMessage({
          id: 'dashboard.header.logOut',
          defaultMessage: 'Log out'
        })}
      >
        <LogoutIcon />
      </HeaderGlobalAction>
    );
  }
}

export default injectIntl(LogoutButton);
