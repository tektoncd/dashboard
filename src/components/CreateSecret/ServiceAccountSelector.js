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

import React from 'react';
import { injectIntl } from 'react-intl';

import { Table } from '@tektoncd/dashboard-components';
import { getErrorMessage } from '@tektoncd/dashboard-utils';
import { InlineNotification } from 'carbon-components-react';
import { DataConnected24 as Patch } from '@carbon/icons-react';

const ServiceAccountSelector = props => {
  const {
    name,
    namespace,
    serviceAccounts,
    intl,
    loading,
    patchSecret,
    errorMessagePatched,
    handleClose
  } = props;

  const initialHeaders = [
    {
      key: 'serviceAccount',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.serviceAccount',
        defaultMessage: 'ServiceAccount'
      })
    }
  ];

  const serviceAccountsFormatted = serviceAccounts
    .filter(serviceAccount => serviceAccount.metadata.namespace === namespace)
    .map(serviceAccount => ({
      id: `${serviceAccount.metadata.namespace}:${serviceAccount.metadata.name}`,
      serviceAccount: serviceAccount.metadata.name
    }));

  return (
    <div className="tkn--selectServiceAccount">
      {errorMessagePatched && (
        <InlineNotification
          kind="error"
          title={intl.formatMessage({
            id: 'dashboard.error.title',
            defaultMessage: 'Error:'
          })}
          subtitle={getErrorMessage(errorMessagePatched)}
          iconDescription={intl.formatMessage({
            id: 'dashboard.notification.clear',
            defaultMessage: 'Clear Notification'
          })}
          data-testid="errorNotificationComponent"
          lowContrast
        />
      )}

      <div className="tkn--serviceAccountHeader">
        <h1>
          {intl.formatMessage(
            {
              id: 'dashboard.createSecret.successMessage',
              defaultMessage: 'Successfully created {name}'
            },
            { name }
          )}
        </h1>
      </div>
      <div>
        <p>
          {intl.formatMessage({
            id: 'dashboard.createSecret.serviceAccountSelectorSubHeading',
            defaultMessage:
              'Select ServiceAccount(s) to add this Secret to. (Optional)'
          })}
        </p>
      </div>
      <Table
        headers={initialHeaders}
        rows={serviceAccountsFormatted}
        loading={loading}
        selectedNamespace={namespace}
        emptyTextAllNamespaces={intl.formatMessage(
          {
            id: 'dashboard.emptyState.allNamespaces',
            defaultMessage: 'No {kind} in any namespace.'
          },
          { kind: 'Secrets' }
        )}
        emptyTextSelectedNamespace={intl.formatMessage(
          {
            id: 'dashboard.emptyState.selectedNamespace',
            defaultMessage: 'No {kind} in namespace {selectedNamespace}'
          },
          { kind: 'Secrets', selectedNamespace: namespace }
        )}
        toolbarButtons={[
          {
            onClick: handleClose,
            text: intl.formatMessage({
              id: 'dashboard.createSecret.finishButton',
              defaultMessage: 'Finish'
            })
          }
        ]}
        batchActionButtons={[
          {
            onClick: serviceAccountsSelected => {
              patchSecret(
                serviceAccountsSelected.map(({ id }) => {
                  const [namespaceSA, nameSA] = id.split(':');
                  return { name: nameSA, namespace: namespaceSA };
                }),
                name,
                handleClose
              );
            },
            text: intl.formatMessage({
              id: 'dashboard.createSecret.patchButton',
              defaultMessage: 'Patch'
            }),
            icon: Patch
          }
        ]}
      />
    </div>
  );
};

export default injectIntl(ServiceAccountSelector);
