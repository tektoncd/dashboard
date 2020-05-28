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

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';

import { Modal } from '@tektoncd/dashboard-components';
import { StopFilled16 } from '@carbon/icons-react';

import './CancelButton.scss';

class CancelButton extends Component {
  state = {
    showDialog: false
  };

  handleCancel = () => {
    const { name, onCancel } = this.props;
    onCancel(name);
    this.handleClose();
  };

  handleClose = () => {
    this.setState({ showDialog: false });
  };

  handleShow = () => {
    this.setState({ showDialog: true });
  };

  render() {
    const { showDialog } = this.state;
    const { intl, type, name } = this.props;
    const closeIcon = <StopFilled16 />;
    return (
      <>
        <button
          type="button"
          title={intl.formatMessage(
            {
              id: 'dashboard.cancelButton.tooltip',
              defaultMessage: 'Stop {type}'
            },
            { type }
          )}
          className="tkn--cancel-button"
          onClick={this.handleShow}
        >
          {closeIcon}
        </button>
        <Modal
          open={showDialog}
          modalHeading={intl.formatMessage(
            {
              id: 'dashboard.cancelButton.heading',
              defaultMessage: 'Stop {type} {name}'
            },
            { type, name }
          )}
          primaryButtonText={intl.formatMessage(
            {
              id: 'dashboard.cancelButton.primaryText',
              defaultMessage: 'Stop {type}'
            },
            { type }
          )}
          secondaryButtonText={intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          })}
          onRequestClose={this.handleClose}
          onRequestSubmit={this.handleCancel}
          onSecondarySubmit={this.handleClose}
        >
          {intl.formatMessage(
            {
              id: 'dashboard.cancelButton.body',
              defaultMessage:
                'Are you sure you would like to stop {type} {name}?'
            },
            { type, name }
          )}
        </Modal>
      </>
    );
  }
}

export default injectIntl(CancelButton);
