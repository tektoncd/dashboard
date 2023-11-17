/*
Copyright 2019-2023 The Tekton Authors
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
import {
  Button,
  OverflowMenu,
  OverflowMenuItem
} from 'carbon-components-react';
import { CaretDown16 } from '@carbon/icons-react';
import { getCarbonPrefix } from '@tektoncd/dashboard-utils';

import Modal from '../Modal';

const carbonPrefix = getCarbonPrefix();

class Actions extends Component {
  state = { showDialog: false };

  handleModalAction = () => {
    const { action } = this.state;
    action();
    this.handleClose();
  };

  handleClose = () => {
    this.setState({ showDialog: false });
  };

  handleClick = (action, modalProperties) => {
    if (modalProperties) {
      this.setState({ action, modal: modalProperties, showDialog: true });
    } else {
      action();
    }
  };

  render() {
    const { modal = {}, showDialog } = this.state;
    const { intl, items, kind, resource } = this.props;
    const isButton = kind === 'button';

    const dialog = showDialog ? (
      <Modal
        open={showDialog}
        modalHeading={modal.heading}
        primaryButtonText={modal.primaryButtonText}
        secondaryButtonText={
          modal.secondaryButtonText ||
          intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          })
        }
        onRequestClose={this.handleClose}
        onRequestSubmit={this.handleModalAction}
        onSecondarySubmit={this.handleClose}
        danger={modal.danger}
      >
        {modal.body && modal.body(resource)}
      </Modal>
    ) : null;

    if (isButton && items.length === 1) {
      const { action, actionText, icon, modalProperties } = items[0];
      return (
        <>
          <Button
            kind="tertiary"
            onClick={() =>
              this.handleClick(() => action(resource), modalProperties)
            }
            renderIcon={icon}
            size="md"
          >
            {actionText}
          </Button>
          {dialog}
        </>
      );
    }

    const title = intl.formatMessage({
      id: 'dashboard.list.menu.tooltip',
      defaultMessage: 'Actions'
    });

    return (
      <>
        <OverflowMenu
          ariaLabel={title}
          className={`tkn--actions-dropdown${
            isButton ? ' tkn--actions-dropdown--button' : ''
          }`}
          flipped
          iconDescription={title}
          selectorPrimaryFocus="button:not([disabled])"
          title={title}
          renderIcon={
            isButton
              ? iconProps => (
                  <span
                    {...iconProps}
                    className={`${carbonPrefix}--btn ${carbonPrefix}--btn--md ${carbonPrefix}--btn--tertiary`}
                  >
                    {title}
                    <CaretDown16 className={`${carbonPrefix}--btn__icon`} />
                  </span>
                )
              : undefined
          }
        >
          {items.map(item => {
            const {
              actionText,
              action,
              danger,
              disable,
              hasDivider,
              modalProperties
            } = item;
            const disabled = disable && disable(resource);
            return (
              <OverflowMenuItem
                disabled={disabled}
                hasDivider={hasDivider}
                isDelete={danger}
                itemText={actionText}
                key={actionText}
                onClick={() =>
                  this.handleClick(() => action(resource), modalProperties)
                }
                requireTitle
              />
            );
          })}
        </OverflowMenu>
        {dialog}
      </>
    );
  }
}

export default injectIntl(Actions);
