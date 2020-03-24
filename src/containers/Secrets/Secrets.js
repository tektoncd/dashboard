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
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { Link } from 'react-router-dom';
import {
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Tooltip
} from 'carbon-components-react';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import { getErrorMessage, getFilters, urls } from '@tektoncd/dashboard-utils';
import { Add16 as Add, Delete16 as Delete } from '@carbon/icons-react';
import { LabelFilter } from '..';
import CreateSecret from '../CreateSecret';
import DeleteModal from '../../components/SecretsDeleteModal';
import {
  clearNotification,
  deleteSecret,
  fetchSecrets,
  resetCreateSecret
} from '../../actions/secrets';
import { selectNamespace } from '../../actions/namespaces';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';
import {
  getDeleteSecretsErrorMessage,
  getDeleteSecretsSuccessMessage,
  getPatchSecretsSuccessMessage,
  getSecrets,
  getSecretsErrorMessage,
  getSelectedNamespace,
  getServiceAccounts,
  isFetchingSecrets,
  isFetchingServiceAccounts,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';

const initialState = {
  openNewSecret: false,
  openDeleteSecret: false,
  toBeDeleted: [],
  selectedType: 'password'
};

export /* istanbul ignore next */ class Secrets extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (
      !isEqual(filters, prevFilters) ||
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.props.clearNotification();
  }

  fetchData = () => {
    const { filters, namespace } = this.props;
    this.props.fetchSecrets({
      filters,
      namespace
    });
    this.props.fetchServiceAccounts();
  };

  handleNewSecretClick = () => {
    this.props.clearNotification();
    this.props.resetCreateSecret();
    this.setState(prevState => {
      return {
        openNewSecret: !prevState.openNewSecret
      };
    });
  };

  handleSelectedType = type => {
    this.setState({
      selectedType: type
    });
  };

  handleHideDeleteSecret = () => {
    this.setState({
      openDeleteSecret: false,
      cancelMethod: null,
      toBeDeleted: []
    });
  };

  handleDeleteSecretClick = (secrets, cancelMethod) => {
    const toBeDeleted = secrets.map(secret => ({
      namespace: secret.id.split(':')[0],
      name: secret.id.split(':')[1]
    }));
    this.setState({
      openDeleteSecret: true,
      cancelMethod,
      toBeDeleted
    });
  };

  handleCloseNewSecret = namespace => {
    this.props.resetCreateSecret();
    this.setState({
      openNewSecret: false
    });
    this.props.selectNamespace(namespace);
    this.fetchData();
  };

  delete = () => {
    this.props.deleteSecret(this.state.toBeDeleted, this.state.cancelMethod);
    this.handleHideDeleteSecret();
  };

  render() {
    const {
      loading,
      deleteSuccess,
      secrets,
      selectedNamespace,
      serviceAccounts,
      intl,
      errorMessage,
      patchSuccess
    } = this.props;

    const {
      openNewSecret,
      toBeDeleted,
      openDeleteSecret,
      selectedType
    } = this.state;

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: this.handleNewSecretClick,
            text: intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            }),
            icon: Add
          }
        ];

    const initialHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.namespace',
          defaultMessage: 'Namespace'
        })
      },
      {
        key: 'serviceAccounts',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.serviceAccounts',
          defaultMessage: 'ServiceAccounts'
        })
      },
      {
        key: 'type',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.type',
          defaultMessage: 'Type'
        })
      }
    ];

    const secretsToUse = [];
    if (selectedType === 'password') {
      initialHeaders.push(
        {
          key: 'username',
          header: intl.formatMessage({
            id: 'dashboard.tableHeader.username',
            defaultMessage: 'Username'
          })
        },
        {
          key: 'annotations',
          header: intl.formatMessage({
            id: 'dashboard.tableHeader.annotations',
            defaultMessage: 'Annotations'
          })
        }
      );
      secrets.forEach(secret => {
        if (secret.type === 'kubernetes.io/basic-auth') {
          secretsToUse.push(secret);
        }
      });
    } else {
      secrets.forEach(secret => {
        if (secret.data.accessToken) {
          secretsToUse.push(secret);
        }
      });
    }

    initialHeaders.push({
      key: 'created',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    });

    const batchActionButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: this.handleDeleteSecretClick,
            text: intl.formatMessage({
              id: 'dashboard.actions.deleteButton',
              defaultMessage: 'Delete'
            }),
            icon: Delete
          }
        ];

    const secretsFormatted = secretsToUse.map(secret => {
      let annotations = '';
      if (secret.metadata.annotations !== undefined) {
        Object.keys(secret.metadata.annotations).forEach(
          function annotationSetup(key) {
            if (key.includes('tekton.dev')) {
              annotations += `${key}: ${secret.metadata.annotations[key]}\n`;
            }
          }
        );
      }
      const serviceAccountsWithSecret = [];
      serviceAccounts.forEach(serviceAccount => {
        serviceAccount.secrets.forEach(secretInServiceAccount => {
          if (
            secretInServiceAccount.name === secret.metadata.name &&
            serviceAccount.metadata.namespace === secret.metadata.namespace
          ) {
            serviceAccountsWithSecret.push(serviceAccount.metadata.name);
          }
        });
      });
      const serviceAccountsString = serviceAccountsWithSecret.join(', ');

      const translatedReload = [
        intl.formatMessage({
          id: 'dashboard.secrets.reload',
          defaultMessage: 'Reload this page to view'
        })
      ];

      // Defaults - todo ensure all data is fetched and displayed so we don't need this
      let secretUsernameToDisplay = translatedReload;
      let secretTypeToDisplay = translatedReload;

      if (secret.data.username) {
        secretUsernameToDisplay = atob(secret.data.username);
      }

      if (secret.type) {
        secretTypeToDisplay = secret.type;
      }

      const formattedSecret = {
        annotations: <span title={annotations}>{annotations}</span>,
        id: `${secret.metadata.namespace}:${secret.metadata.name}`,
        name: (
          <Link
            to={urls.secrets.byName({
              namespace: secret.metadata.namespace,
              secretName: secret.metadata.name
            })}
            title={secret.metadata.name}
          >
            {secret.metadata.name}
          </Link>
        ),
        namespace: (
          <span title={secret.metadata.namespace}>
            {secret.metadata.namespace}
          </span>
        ),
        created: (
          <FormattedDate date={secret.metadata.creationTimestamp} relative />
        ),
        serviceAccounts: (
          <span title={serviceAccountsString}>{serviceAccountsString}</span>
        ),
        type: <span title={secretTypeToDisplay}>{secretTypeToDisplay}</span>,
        username: (
          <span title={secretUsernameToDisplay}>{secretUsernameToDisplay}</span>
        )
      };
      return formattedSecret;
    });

    return (
      <>
        {patchSuccess && (
          <InlineNotification
            kind="success"
            title={intl.formatMessage({
              id: 'dashboard.secrets.success',
              defaultMessage: 'Success:'
            })}
            subtitle={intl.formatMessage({
              id: 'dashboard.secrets.patchedSuccess',
              defaultMessage: 'Secret patched successfully'
            })}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        {deleteSuccess && (
          <InlineNotification
            kind="success"
            title={intl.formatMessage({
              id: 'dashboard.secrets.success',
              defaultMessage: 'Success:'
            })}
            subtitle={intl.formatMessage({
              id: 'dashboard.secrets.deleteSuccess',
              defaultMessage: 'Secret deleted successfully'
            })}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        {errorMessage && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(errorMessage)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        {!openNewSecret && (
          <>
            <h1>Secrets</h1>
            <LabelFilter {...this.props} />
            <Tooltip
              className="secretHelperTooltip"
              direction="bottom"
              tabIndex={0}
              tooltipBodyId="secret-type-helper"
              triggerText="Secret type"
            >
              <div className="secretHelper">
                {intl.formatMessage({
                  id: 'dashboard.secretType.helper',
                  defaultMessage: `Use Password if you plan to
                have a PipelineRun that clones from a Git
                repository or image registry that requires authentication. 

                Use Access Token when interacting with webhooks or PullRequest resources. 
                
                Check the official Tekton Pipelines documentation for more details.`
                })}
              </div>
            </Tooltip>
            <RadioButtonGroup
              legend={intl.formatMessage({
                id: 'dashboard.universalFields.secretType',
                defaultMessage: 'Type'
              })}
              name="secret-type"
              orientation="horizontal"
              labelPosition="right"
              valueSelected={selectedType}
              onChange={this.handleSelectedType}
            >
              <RadioButton
                value="password"
                id="password-radio"
                labelText={intl.formatMessage({
                  id: 'dashboard.universalFields.passwordRadioButton',
                  defaultMessage: 'Password'
                })}
              />
              <RadioButton
                value="accessToken"
                id="access-radio"
                labelText={intl.formatMessage({
                  id: 'dashboard.universalFields.accessTokenRadioButton',
                  defaultMessage: 'Access Token'
                })}
              />
            </RadioButtonGroup>
            <Table
              headers={initialHeaders}
              rows={secretsFormatted}
              handleDisplayModal={this.handleDisplayModalClick}
              handleDelete={this.handleDeleteSecretClick}
              loading={loading}
              selectedNamespace={selectedNamespace}
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
                { kind: 'Secrets', selectedNamespace }
              )}
              batchActionButtons={batchActionButtons}
              toolbarButtons={toolbarButtons}
            />
            {!this.props.isReadOnly && (
              <DeleteModal
                open={openDeleteSecret}
                handleClick={this.handleHideDeleteSecret}
                handleDelete={this.delete}
                toBeDeleted={toBeDeleted}
              />
            )}
          </>
        )}
        {openNewSecret && (
          <CreateSecret
            handleClose={this.handleCloseNewSecret}
            handleSelectedType={this.handleSelectedType}
            secrets={secrets}
          />
        )}
      </>
    );
  }
}

Secrets.defaultProps = {
  secrets: []
};

function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    errorMessage:
      getDeleteSecretsErrorMessage(state) || getSecretsErrorMessage(state),
    deleteSuccess: getDeleteSecretsSuccessMessage(state),
    isReadOnly: isReadOnly(state),
    patchSuccess: getPatchSecretsSuccessMessage(state),
    filters,
    loading: isFetchingSecrets(state) || isFetchingServiceAccounts(state),
    secrets: getSecrets(state, { filters, namespace }),
    serviceAccounts: getServiceAccounts(state),
    selectedNamespace: namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  clearNotification,
  deleteSecret,
  fetchSecrets,
  fetchServiceAccounts,
  resetCreateSecret,
  selectNamespace
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Secrets));
