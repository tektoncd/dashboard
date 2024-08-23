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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  MenuButton,
  MenuItem,
  MenuItemDivider,
  OverflowMenu,
  OverflowMenuItem
} from '@carbon/react';

import Modal from '../Modal';

export default function Actions({ items, kind, resource }) {
  const intl = useIntl();

  const [state, setState] = useState({
    action: undefined,
    modal: {},
    showDialog: false
  });

  function handleClose() {
    setState(prevState => ({ ...prevState, showDialog: false }));
  }

  function handleModalAction() {
    state.action();
    handleClose();
  }

  function handleClick(itemAction, modalProperties) {
    if (modalProperties) {
      setState(prevState => ({
        ...prevState,
        action: itemAction,
        modal: modalProperties,
        showDialog: true
      }));
    } else {
      itemAction();
    }
  }

  function getButton() {
    const isButton = kind === 'button';

    if (isButton && items.length === 1) {
      const {
        action: itemAction,
        actionText,
        danger,
        icon,
        modalProperties
      } = items[0];
      return (
        <Button
          kind={danger ? 'danger' : 'tertiary'}
          onClick={() =>
            handleClick(() => itemAction(resource), modalProperties)
          }
          renderIcon={icon}
          size="md"
        >
          {actionText}
        </Button>
      );
    }

    const title = intl.formatMessage({
      id: 'dashboard.list.menu.tooltip',
      defaultMessage: 'Actions'
    });

    if (isButton) {
      return (
        <MenuButton
          className="tkn--actions-dropdown"
          kind="tertiary"
          label={title}
          menuAlignment="bottom-end"
          size="md"
        >
          {items.map(item => {
            const {
              actionText,
              action: itemAction,
              danger,
              disable,
              hasDivider,
              modalProperties
            } = item;
            const disabled = disable && disable(resource);
            return (
              <>
                {hasDivider && <MenuItemDivider />}
                <MenuItem
                  disabled={disabled}
                  key={actionText}
                  kind={danger ? 'danger' : 'default'}
                  label={actionText}
                  onClick={() =>
                    handleClick(() => itemAction(resource), modalProperties)
                  }
                />
              </>
            );
          })}
        </MenuButton>
      );
    }
    return (
      <OverflowMenu
        align="left"
        aria-label={title}
        className="tkn--actions-dropdown"
        flipped
        iconDescription={title}
        selectorPrimaryFocus="button:not([disabled])"
        title={title}
      >
        {items.map(item => {
          const {
            actionText,
            action: itemAction,
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
                handleClick(() => itemAction(resource), modalProperties)
              }
              requireTitle
            />
          );
        })}
      </OverflowMenu>
    );
  }

  const dialog = state.showDialog ? (
    <Modal
      open={state.showDialog}
      modalHeading={state.modal.heading}
      primaryButtonText={state.modal.primaryButtonText}
      secondaryButtonText={
        state.modal.secondaryButtonText ||
        intl.formatMessage({
          id: 'dashboard.modal.cancelButton',
          defaultMessage: 'Cancel'
        })
      }
      onRequestClose={handleClose}
      onRequestSubmit={handleModalAction}
      onSecondarySubmit={handleClose}
      danger={state.modal.danger}
    >
      {state.modal.body && state.modal.body(resource)}
    </Modal>
  ) : null;

  return (
    <>
      {getButton()}
      {dialog}
    </>
  );
}
