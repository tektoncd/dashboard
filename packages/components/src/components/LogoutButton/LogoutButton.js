import LogoutIcon from '@carbon/icons-react/lib/logout/20';
import { Button } from 'carbon-components-react';
import { injectIntl } from 'react-intl';
import React, { Component } from 'react';
import './LogoutButton.scss';

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
      <Button
        data-testid="logout-btn"
        kind="ghost"
        className="logout-btn"
        renderIcon={LogoutIcon}
        onClick={handleLogout}
      >
        {this.props.intl.formatMessage({
          id: 'dashboard.header.logOut',
          defaultMessage: 'Log out'
        })}
      </Button>
    );
  }
}

export default injectIntl(LogoutButton);
