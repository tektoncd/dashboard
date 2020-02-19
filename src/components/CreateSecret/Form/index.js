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

import { getErrorMessage } from '@tektoncd/dashboard-utils';
import { Button, InlineNotification } from 'carbon-components-react';
import UniversalFields from './UniversalFields';
import PasswordType from './PasswordType';
import AccessTokenType from './AccessTokenType';
import Annotations from './Annotations';

function getNotification(message, intl, callback) {
  const notification = (
    <InlineNotification
      kind="error"
      title={intl.formatMessage({
        id: 'dashboard.error.title',
        defaultMessage: 'Error:'
      })}
      subtitle={message}
      iconDescription={intl.formatMessage({
        id: 'dashboard.notification.clear',
        defaultMessage: 'Clear Notification'
      })}
      className="notificationComponent"
      data-testid="errorNotificationComponent"
      lowContrast
      onCloseButtonClick={callback}
    />
  );
  return notification;
}

const Form = props => {
  const {
    annotations,
    name,
    namespace,
    accessToken,
    username,
    password,
    invalidFields,
    secretType,
    errorMessageDuplicate,
    loading,
    handleClose,
    intl,
    submit,
    handleChangeTextInput,
    handleChangeNamespace,
    handleSecretType,
    handleAnnotationChange,
    handleAdd,
    handleRemove,
    errorMessageCreated,
    removeDuplicateErrorMessage
  } = props;

  return (
    <div className="createSecret">
      {errorMessageDuplicate &&
        getNotification(
          errorMessageDuplicate,
          intl,
          removeDuplicateErrorMessage
        )}
      {errorMessageCreated &&
        getNotification(getErrorMessage(errorMessageCreated), intl, null)}
      <div className="heading">
        <h1> Create new Secret </h1>
        <Button
          iconDescription={intl.formatMessage({
            id: 'dashboard.createSecret.cancelButton',
            defaultMessage: 'Cancel'
          })}
          kind="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          iconDescription={intl.formatMessage({
            id: 'dashboard.createSecret.createButton',
            defaultMessage: 'Create'
          })}
          onClick={submit}
          disabled={loading}
        >
          Create
        </Button>
      </div>
      <form>
        <UniversalFields
          name={name}
          selectedNamespace={namespace}
          secretType={secretType}
          handleChangeTextInput={handleChangeTextInput}
          handleChangeNamespace={handleChangeNamespace}
          handleSecretType={handleSecretType}
          invalidFields={invalidFields}
          loading={loading}
        />
        {secretType === 'password' && (
          <PasswordType
            username={username}
            password={password}
            handleChangeTextInput={handleChangeTextInput}
            invalidFields={invalidFields}
            loading={loading}
          />
        )}
        {secretType === 'accessToken' && (
          <AccessTokenType
            accessToken={accessToken}
            handleChangeTextInput={handleChangeTextInput}
            invalidFields={invalidFields}
            loading={loading}
          />
        )}
        {secretType === 'password' && (
          <Annotations
            annotations={annotations}
            handleAnnotationChange={handleAnnotationChange}
            invalidFields={invalidFields}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
            loading={loading}
          />
        )}
      </form>
    </div>
  );
};

export default injectIntl(Form);
