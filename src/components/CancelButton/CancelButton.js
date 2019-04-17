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

/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';

import { Icon, Modal } from 'carbon-components-react';

import './CancelButton.scss';

class CancelButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false
    };
  }

  handleCancel = () => {
    const { name, onCancel } = this.props;
    onCancel(name);
    this.handleClose();
  };

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  render() {
    const closeIcon = (
      <Icon className="cancel-icon" name="icon--close--solid" />
    );
    const { show } = this.state;
    const { type, name } = this.props;
    return (
      <>
        <button
          type="button"
          className="cancel-button"
          onClick={this.handleShow}
        >
          {closeIcon}
        </button>
        <Modal
          open={show}
          modalHeading={`Cancel ${type}`}
          primaryButtonText="Yes"
          secondaryButtonText="No"
          onRequestClose={this.handleClose}
          onRequestSubmit={this.handleCancel}
          onSecondarySubmit={this.handleClose}
        >
          Are you sure you would like to cancel {type} {name} ?
        </Modal>
      </>
    );
  }
}

export default CancelButton;
