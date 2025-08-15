/*
Copyright 2025 The Tekton Authors
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
/* istanbul ignore file */

import { useIntl } from 'react-intl';

import CancelStatusOptions from '../CancelStatusOptions';
import Modal from '../Modal';
import Table from '../Table';

const StopModal = ({
  cancelStatus,
  onClose,
  onSubmit,
  kind,
  onChangeCancelStatus,
  resources,
  showNamespace = true
}) => {
  const intl = useIntl();
  return (
    <Modal
      className="tkn--stop-modal"
      open
      primaryButtonText={intl.formatMessage({
        id: 'dashboard.actions.stopButton',
        defaultMessage: 'Stop'
      })}
      secondaryButtonText={intl.formatMessage({
        id: 'dashboard.modal.cancelButton',
        defaultMessage: 'Cancel'
      })}
      modalHeading={intl.formatMessage(
        {
          id: 'dashboard.stopRuns.heading',
          defaultMessage: 'Stop {kind}'
        },
        { kind }
      )}
      onSecondarySubmit={onClose}
      onRequestSubmit={onSubmit}
      onRequestClose={onClose}
      danger
    >
      <p>
        {intl.formatMessage(
          {
            id: 'dashboard.stopRuns.confirm',
            defaultMessage: 'Are you sure you want to stop these {kind}?'
          },
          { kind }
        )}
      </p>
      <Table
        headers={[
          {
            key: 'name',
            header: intl.formatMessage({
              id: 'dashboard.tableHeader.name',
              defaultMessage: 'Name'
            })
          },
          showNamespace
            ? {
                key: 'namespace',
                header: 'Namespace'
              }
            : null
        ].filter(Boolean)}
        rows={resources.map(resource => ({
          id: resource.metadata.uid,
          name: resource.metadata.name,
          namespace: resource.metadata.namespace
        }))}
        size="sm"
      />
      {cancelStatus ? (
        <CancelStatusOptions
          cancelStatus={cancelStatus}
          onChangeCancelStatus={onChangeCancelStatus}
        />
      ) : null}
    </Modal>
  );
};

export default StopModal;
