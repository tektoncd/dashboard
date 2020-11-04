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

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { OverflowMenu, OverflowMenuItem } from 'carbon-components-react';
import { Modal } from '@tektoncd/dashboard-components';

class RunDropdown extends Component {
  state = { showDialog: false };

  handleModalAction = () => {
    const { action } = this.state;
    action();
    this.handleClose();
  };

  handleClose = () => {
    this.setState({ showDialog: false });
  };

  handleShow = (action, modalProperties) => {
    if (modalProperties) {
      this.setState({ action, modal: modalProperties, showDialog: true });
    } else {
      action();
    }
  };

  render() {
    const { modal = {}, showDialog } = this.state;
    const { intl, items, resource } = this.props;

    const title = intl.formatMessage({
      id: 'dashboard.list.menu.tooltip',
      defaultMessage: 'Actions'
    });

    return (
      <>
        <OverflowMenu
          title={title}
          ariaLabel={title}
          iconDescription={title}
          data-testid="overflowmenu"
          flipped
          selectorPrimaryFocus="button:not([disabled])"
        >
          {items.map(item => {
            const {
              actionText,
              action,
              danger,
              disable,
              modalProperties
            } = item;
            const disabled = disable && disable(resource);
            return (
              <OverflowMenuItem
                key={actionText}
                itemText={actionText}
                isDelete={danger}
                disabled={disabled}
                onClick={() =>
                  this.handleShow(() => action(resource), modalProperties)
                }
                requireTitle
              />
            );
          })}
        </OverflowMenu>
        {showDialog ? (
          <Modal
            open={showDialog}
            modalHeading={modal.heading}
            primaryButtonText={modal.primaryButtonText}
            secondaryButtonText={modal.secondaryButtonText}
            onRequestClose={this.handleClose}
            onRequestSubmit={this.handleModalAction}
            onSecondarySubmit={this.handleClose}
            danger={modal.danger}
          >
            {modal.body && modal.body(resource)}
          </Modal>
        ) : null}
      </>
    );
  }
}

export default injectIntl(RunDropdown);
