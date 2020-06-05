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

import React from 'react';
import { injectIntl } from 'react-intl';
import { ListItem, UnorderedList } from 'carbon-components-react';
import { Modal } from '@tektoncd/dashboard-components';

const SecretsDeleteModal = props => {
  const { intl, open, toBeDeleted, handleClick, handleDelete } = props;

  return (
    <Modal
      open={open}
      data-testid="deleteModal"
      primaryButtonText={intl.formatMessage({
        id: 'dashboard.actions.deleteButton',
        defaultMessage: 'Delete'
      })}
      secondaryButtonText={intl.formatMessage({
        id: 'dashboard.modal.cancelButton',
        defaultMessage: 'Cancel'
      })}
      modalHeading={intl.formatMessage({
        id: 'dashboard.secrets.deleteHeading',
        defaultMessage: 'Delete Secret'
      })}
      onSecondarySubmit={handleClick}
      onRequestSubmit={handleDelete}
      onRequestClose={handleClick}
      danger
    >
      <p>
        {intl.formatMessage({
          id: 'dashboard.secrets.deleteConfirm',
          defaultMessage: 'Are you sure you want to delete these Secrets?'
        })}
      </p>
      <UnorderedList nested>
        {toBeDeleted.map(secret => {
          const { name, namespace } = secret;
          return <ListItem key={`${name}:${namespace}`}>{name}</ListItem>;
        })}
      </UnorderedList>
    </Modal>
  );
};

export default injectIntl(SecretsDeleteModal);
