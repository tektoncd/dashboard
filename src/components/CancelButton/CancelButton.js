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

import { Button, Icon, Modal } from 'carbon-components-react';

class CancelButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleCancel = ()=> {
  	const { name, onCancel } = this.props;
  	onCancel(name);
  	this.handleClose();
  }

  render(){
  	const closeIcon = <Icon className='cancel-icon' name='icon--close--solid' className="status-icon" />;
  	const { show } = this.state;
  	const { id, type, name, onCancel } = this.props;
     return (<>
     	<button className='cancel-button' onClick={this.handleShow}>{closeIcon}</button>
	      <Modal id={id} open={show} modalHeading={"Cancel "+ type} primaryButtonText="Yes" secondaryButtonText="No" 
	      onRequestClose={this.handleClose} onRequestSubmit={this.handleCancel} onSecondarySubmit={this.handleClose}>
	        Are you sure you would like to cancel {type} {name} ?
	      </Modal>
        </>);
  }

}

export default CancelButton;