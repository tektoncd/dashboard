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
import { Modal } from 'carbon-components-react';
import './SecretsDeleteModal.scss';

export /* istanbul ignore next */ class SecretsDeleteModal extends Component {
  componentDidMount() {
    const secondaryButton = document.getElementsByClassName(
      'bx--btn--secondary'
    )[0];

    const primaryButton = document.getElementsByClassName(
      'bx--btn--primary'
    )[0];
    const closeButton = document.getElementsByClassName('bx--modal-close')[0];
    secondaryButton.addEventListener('click', this.props.handleClick);
    closeButton.addEventListener('click', this.props.handleClick);
    primaryButton.addEventListener('click', this.props.handleDelete);
  }

  render() {
    const { open, id } = this.props;

    return (
      <Modal
        open={open}
        className="deleteModal"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        modalHeading="Delete Secret"
      >
        <p>
          Are you sure you want to delete the secret <strong>{id}</strong>?
        </p>
      </Modal>
    );
  }
}

export default SecretsDeleteModal;
