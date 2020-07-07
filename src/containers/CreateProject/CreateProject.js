/*
Copyright 2020 The Tekton Authors
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
import {
  Form,
  FormGroup,
  InlineNotification,
  TextInput
} from 'carbon-components-react';
import { ALL_NAMESPACES, generateId } from '@tektoncd/dashboard-utils';
import { KeyValueList, Modal } from '@tektoncd/dashboard-components';
import { injectIntl } from 'react-intl';
import { NamespacesDropdown, ServiceAccountsDropdown } from '..';
import { createProject } from '../../api';
import { isValidLabel } from '../../utils';

import '../../scss/Create.scss';

const initialState = {
  name: '',
  namespace: '',
  ingress: '',
  ingressLabels: [],
  invalidIngressLabels: {},
  ingressAnnotations: [],
  invalidIngressAnnotations: {},
  bindings: [
    {
      id: generateId(`label0-`),
      key: 'gitrevision',
      keyPlaceholder: 'key',
      value: '$(body.head_commit.id)',
      valuePlaceholder: 'value'
    },
    {
      id: generateId(`label1-`),
      key: 'gitrepositoryurl',
      keyPlaceholder: 'key',
      value: '$(body.repository.url)',
      valuePlaceholder: 'value'
    }
  ],
  invalidBindings: {},
  serviceAccount: '',
  submitError: '',
  validationError: false
};

class CreateProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();
  }

  componentDidUpdate(prevProps) {
    const { namespace, open } = this.props;
    const { namespace: prevNamespace, open: prevOpen } = prevProps;

    if ((open && !prevOpen) || namespace !== prevNamespace) {
      this.resetForm();
    }
  }

  handleClose = () => {
    this.props.onClose();
  };

  handleNamespaceChange = ({ selectedItem }) => {
    const { text = '' } = selectedItem || {};
    if (text !== this.state.namespace) {
      this.setState({
        ...initialState,
        namespace: text
      });
    }
  };

  handleSubmit = event => {
    event.preventDefault();

    const {
      name,
      namespace,
      ingress,
      ingressLabels,
      ingressAnnotations,
      bindings,
      serviceAccount
    } = this.state;

    createProject({
      name,
      namespace,
      serviceAccount,
      ingress,
      ingressLabels: ingressLabels.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      ingressAnnotations: ingressAnnotations.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      bindings: bindings.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}),
      interceptors: [
        {
          github: {
            eventTypes: ['push']
          }
        }
      ]
    })
      .then(response => {
        this.props.onSuccess(response);
      })
      .catch(error => {
        error.response.text().then(text => {
          const statusCode = error.response.status;
          let errorMessage = `error code ${statusCode}`;
          if (text) {
            errorMessage = `${text} (error code ${statusCode})`;
          }
          this.setState({ submitError: errorMessage });
        });
      });
  };

  initialState = () => {
    const { namespace } = this.props;
    return {
      ...initialState,
      namespace: namespace !== ALL_NAMESPACES ? namespace : ''
    };
  };

  resetForm = () => {
    this.setState(this.initialState());
  };

  handleAddLabel = prop => {
    this.setState(prevState => ({
      [prop]: [
        ...prevState[prop],
        {
          id: generateId(`label${prevState[prop].length}-`),
          key: '',
          keyPlaceholder: 'key',
          value: '',
          valuePlaceholder: 'value'
        }
      ]
    }));
  };

  handleRemoveLabel = (prop, invalidProp, index) => {
    this.setState(prevState => {
      const labels = [...prevState[prop]];
      const invalidLabels = { ...prevState[invalidProp] };
      const removedLabel = labels[index];
      labels.splice(index, 1);
      if (removedLabel.id in invalidLabels) {
        delete invalidLabels[`${removedLabel.id}-key`];
        delete invalidLabels[`${removedLabel.id}-value`];
      }
      return {
        [prop]: labels,
        [invalidProp]: invalidLabels
      };
    });
  };

  handleChangeLabel = (prop, invalidProp, { type, index, value }) => {
    this.setState(prevState => {
      const labels = [...prevState[prop]];
      labels[index][type] = value;
      const invalidLabels = { ...prevState[invalidProp] };
      if (!isValidLabel(type, value)) {
        invalidLabels[`${labels[index].id}-${type}`] = true;
      } else {
        delete invalidLabels[`${labels[index].id}-${type}`];
      }
      return {
        [prop]: labels,
        [invalidProp]: invalidLabels
      };
    });
  };

  render() {
    const { open, intl } = this.props;
    const {
      name,
      namespace,
      serviceAccount,
      ingress,
      ingressLabels,
      invalidIngressLabels,
      ingressAnnotations,
      invalidIngressAnnotations,
      bindings,
      invalidBindings,
      submitError,
      validationError
    } = this.state;

    return (
      <Form>
        <Modal
          className="tkn--create"
          open={open}
          modalHeading="Create Project"
          primaryButtonText={intl.formatMessage({
            id: 'dashboard.actions.createButton',
            defaultMessage: 'Create'
          })}
          secondaryButtonText={intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          })}
          onRequestSubmit={this.handleSubmit}
          onRequestClose={this.handleClose}
          onSecondarySubmit={this.handleClose}
        >
          {validationError && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createRun.validationError',
                defaultMessage:
                  'Please fix the fields with errors, then resubmit'
              })}
              lowContrast
            />
          )}
          {submitError !== '' && (
            <InlineNotification
              kind="error"
              title={intl.formatMessage({
                id: 'dashboard.createTaskRun.createError',
                defaultMessage: 'Error creating TaskRun'
              })}
              subtitle={submitError}
              onCloseButtonClick={() => this.setState({ submitError: '' })}
              lowContrast
            />
          )}
          <FormGroup legendText="">
            <NamespacesDropdown
              id="create-project--namespaces-dropdown"
              invalid={validationError && !namespace}
              invalidText={intl.formatMessage({
                id: 'dashboard.createRun.invalidNamespace',
                defaultMessage: 'Namespace cannot be empty'
              })}
              selectedItem={namespace ? { id: namespace, text: namespace } : ''}
              onChange={this.handleNamespaceChange}
            />
          </FormGroup>
          <FormGroup legendText="">
            <ServiceAccountsDropdown
              id="create-taskrun--sa-dropdown"
              titleText="Service Account"
              namespace={namespace}
              selectedItem={
                serviceAccount
                  ? { id: serviceAccount, text: serviceAccount }
                  : ''
              }
              disabled={namespace === ''}
              onChange={({ selectedItem }) => {
                const { text } = selectedItem || {};
                this.setState({ serviceAccount: text });
              }}
            />
          </FormGroup>
          <FormGroup legendText="">
            <TextInput
              id="create-project--name"
              labelText="Name"
              placeholder="project"
              value={name}
              onChange={({ target: { value } }) =>
                this.setState({ name: value })
              }
            />
          </FormGroup>
          <FormGroup legendText="">
            <TextInput
              id="create-project--ingress"
              labelText="Ingress"
              placeholder="project.127.0.0.1.nip.io"
              value={ingress}
              onChange={({ target: { value } }) =>
                this.setState({ ingress: value })
              }
            />
          </FormGroup>
          <FormGroup legendText="">
            <KeyValueList
              legendText="Ingress Labels"
              keyValues={ingressLabels}
              minKeyValues={0}
              invalidFields={invalidIngressLabels}
              onChange={label =>
                this.handleChangeLabel(
                  'ingressLabels',
                  'invalidIngressLabels',
                  label
                )
              }
              onRemove={index =>
                this.handleRemoveLabel(
                  'ingressLabels',
                  'invalidIngressLabels',
                  index
                )
              }
              onAdd={() => this.handleAddLabel('ingressLabels')}
            />
          </FormGroup>
          <FormGroup legendText="">
            <KeyValueList
              legendText="Ingress Annotations"
              keyValues={ingressAnnotations}
              minKeyValues={0}
              invalidFields={invalidIngressAnnotations}
              onChange={label =>
                this.handleChangeLabel(
                  'ingressAnnotations',
                  'invalidIngressAnnotations',
                  label
                )
              }
              onRemove={index =>
                this.handleRemoveLabel(
                  'ingressAnnotations',
                  'invalidIngressAnnotations',
                  index
                )
              }
              onAdd={() => this.handleAddLabel('ingressAnnotations')}
            />
          </FormGroup>
          <FormGroup legendText="">
            <KeyValueList
              legendText="Trigger bindings"
              keyValues={bindings}
              minKeyValues={0}
              invalidFields={invalidBindings}
              onChange={label =>
                this.handleChangeLabel('bindings', 'invalidBindings', label)
              }
              onRemove={index =>
                this.handleRemoveLabel('bindings', 'invalidBindings', index)
              }
              onAdd={() => this.handleAddLabel('bindings')}
            />
          </FormGroup>
        </Modal>
      </Form>
    );
  }
}

CreateProject.defaultProps = {
  open: false,
  onClose: () => {},
  onSuccess: () => {}
};

export default injectIntl(CreateProject);
