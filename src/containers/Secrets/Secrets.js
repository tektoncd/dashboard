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
  FormGroup,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Tooltip
} from 'carbon-components-react';
import { FormattedDate, Table } from '@tektoncd/dashboard-components';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import { Add16 as Add, TrashCan32 as Delete } from '@carbon/icons-react';
import { ListPageLayout } from '..';
import DeleteModal from '../../components/SecretsDeleteModal';
import {
  clearNotification,
  deleteSecret,
  fetchSecrets
} from '../../actions/secrets';
import { selectNamespace } from '../../actions/namespaces';
import { fetchServiceAccounts } from '../../actions/serviceAccounts';
import {
  getDeleteSecretsErrorMessage,
  getDeleteSecretsSuccessMessage,
  getPatchSecretsSuccessMessage,
  getSecrets,
  getSelectedNamespace,
  getServiceAccounts,
  isFetchingSecrets,
  isFetchingServiceAccounts,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';

const initialState = {
  openDeleteSecret: false,
  toBeDeleted: []
};

function base64Decode(input) {
  return decodeURIComponent(
    atob(input)
      .split('')
      .map(
        character =>
          '%' + // eslint-disable-line prefer-template
          (
            '00' + // eslint-disable-line prefer-template
            character
              .charCodeAt(0) // returns UTF-16 code unit for this character
              .toString(16)
          ) // set radix 16 to ensure we get a UTF-16 encoded string
            .slice(-2) // account for the '00' padding
      )
      .join('')
  );
}

export /* istanbul ignore next */ class Secrets extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    document.title = getTitle({ page: 'Secrets' });
    const secretType = this.getSecretType();
    this.handleSecretType(secretType);
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

  getSecretType() {
    const { location } = this.props;
    const urlSearchParams = new URLSearchParams(location.search);
    const secretType = urlSearchParams.get('secretType') || 'password';
    return secretType;
  }

  fetchData = () => {
    const { filters, namespace } = this.props;
    this.props.fetchSecrets({
      filters,
      namespace
    });
    this.props.fetchServiceAccounts();
  };

  handleSecretType = secretType => {
    const { history, location, match } = this.props;
    const urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.set('secretType', secretType);
    history.push(`${match.url}?${urlSearchParams.toString()}`);
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

    const { toBeDeleted, openDeleteSecret } = this.state;
    const secretType = this.getSecretType();

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: () =>
              this.props.history.push(
                `${urls.secrets.create()}?secretType=${secretType}`
              ),
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
        header: 'Namespace'
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
    if (secretType === 'password') {
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
        if (secret.data && secret.data.accessToken) {
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
        Object.keys(secret.metadata.annotations).forEach(key => {
          if (key.includes('tekton.dev')) {
            annotations += `${key}: ${secret.metadata.annotations[key]}\n`;
          }
        });
      }
      const serviceAccountsWithSecret = [];
      serviceAccounts.forEach(serviceAccount => {
        (serviceAccount.secrets || []).forEach(secretInServiceAccount => {
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

      // Defaults - TODO ensure all data is fetched and displayed so we don't need this
      let secretUsernameToDisplay = translatedReload;
      let secretTypeToDisplay = translatedReload;

      if (secret.data.username) {
        secretUsernameToDisplay = base64Decode(secret.data.username);
      }

      if (secret.type) {
        secretTypeToDisplay = secret.type;
      }

      const formattedSecret = {
        annotations,
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
        namespace: secret.metadata.namespace,
        created: (
          <FormattedDate date={secret.metadata.creationTimestamp} relative />
        ),
        serviceAccounts: serviceAccountsString,
        type: secretTypeToDisplay,
        username: secretUsernameToDisplay
      };
      return formattedSecret;
    });

    return (
      <ListPageLayout title="Secrets" {...this.props}>
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
        <FormGroup
          legendText={
            <Tooltip
              direction="right"
              tabIndex={0}
              tooltipBodyId="secret-type-helper"
              triggerText={intl.formatMessage({
                id: 'dashboard.secretType.type',
                defaultMessage: 'Secret type'
              })}
            >
              <div>
                {intl.formatMessage({
                  id: 'dashboard.secretType.helper',
                  defaultMessage: `Use Password with git or image PipelineResources that require authentication. Use Access Token with webhooks or with pullRequest PipelineResources. Check the Tekton Pipelines documentation for more details on authentication.`
                })}
              </div>
            </Tooltip>
          }
        >
          <RadioButtonGroup
            legend={intl.formatMessage({
              id: 'dashboard.universalFields.secretType',
              defaultMessage: 'Type'
            })}
            name="secret-type"
            orientation="horizontal"
            labelPosition="right"
            valueSelected={secretType}
            onChange={this.handleSecretType}
            role="radiogroup"
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
                id: 'dashboard.accessTokenField.accessToken',
                defaultMessage: 'Access Token'
              })}
            />
          </RadioButtonGroup>
        </FormGroup>
        <Table
          headers={initialHeaders}
          rows={secretsFormatted}
          handleDisplayModal={this.handleDisplayModalClick}
          handleDelete={this.handleDeleteSecretClick}
          loading={loading && !secretsFormatted.length}
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
        {!this.props.isReadOnly && openDeleteSecret && (
          <DeleteModal
            open={openDeleteSecret}
            handleClick={this.handleHideDeleteSecret}
            handleDelete={this.delete}
            toBeDeleted={toBeDeleted}
          />
        )}
      </ListPageLayout>
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
    errorMessage: getDeleteSecretsErrorMessage(state),
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
  selectNamespace
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Secrets));
