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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import {
  getAddFilterHandler,
  getDeleteFilterHandler,
  getErrorMessage,
  getFilters,
  urls
} from '@tektoncd/dashboard-utils';
import {
  LabelFilter,
  PipelineResources as PipelineResourcesList
} from '@tektoncd/dashboard-components';
import { Button, InlineNotification } from 'carbon-components-react';
import Add from '@carbon/icons-react/lib/add/16';
import { fetchPipelineResources } from '../../actions/pipelineResources';
import { deletePipelineResource } from '../../api';
import PipelineResourcesModal from '../PipelineResourcesModal';

import {
  getPipelineResources,
  getPipelineResourcesErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineResources,
  isWebSocketConnected
} from '../../reducers';

const initialState = {
  showCreatePipelineResourceModal: false,
  createdPipelineResource: null
};

export /* istanbul ignore next */ class PipelineResources extends Component {
  constructor(props) {
    super(props);

    this.handleCreatePipelineResourceSuccess = this.handleCreatePipelineResourceSuccess.bind(
      this
    );

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
      namespace !== prevNamespace ||
      (webSocketConnected && prevWebSocketConnected === false) ||
      !isEqual(filters, prevFilters)
    ) {
      this.fetchData();
    }
  }

  toggleModal = showCreatePipelineResourceModal => {
    this.setState({ showCreatePipelineResourceModal });
  };

  deleteResource = pipelineResource => {
    const { name, namespace } = pipelineResource.metadata;
    deletePipelineResource({ name, namespace });
  };

  pipelineResourceActions = () => {
    const { intl } = this.props;
    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.deletePipelineResource.actionText',
          defaultMessage: 'Delete'
        }),
        action: this.deleteResource,
        modalProperties: {
          danger: true,
          heading: intl.formatMessage({
            id: 'dashboard.deletePipelineResource.heading',
            defaultMessage: 'Delete PipelineResource'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.deletePipelineResource.primaryText',
            defaultMessage: 'Delete PipelineResource'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deletePipelineResource.body',
                defaultMessage:
                  'Are you sure you would like to delete PipelineResource {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  };

  handleCreatePipelineResourceClick = showCreatePipelineResourceModal => {
    if (showCreatePipelineResourceModal) {
      this.setState({
        showCreatePipelineResourceModal: false
      });
    }
  };

  handleCreatePipelineResourceSuccess(newPipelineResource) {
    const {
      metadata: { namespace, name }
    } = newPipelineResource;
    const url = urls.pipelineResources.byName({
      namespace,
      pipelineResourceName: name
    });
    this.toggleModal(false);
    this.setState({ createdPipelineResource: { name, url } });
  }

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchPipelineResources({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      filters,
      loading,
      namespace: selectedNamespace,
      pipelineResources,
      intl
    } = this.props;

    const pipelineResourceActions = this.pipelineResourceActions();

    const createPipelineResourceButton = (
      <Button
        iconDescription={intl.formatMessage({
          id: 'dashboard.pipelineResource.createPipelineResourceTitle',
          defaultMessage: 'Create PipelineResource'
        })}
        renderIcon={Add}
        type="button"
        onClick={() => this.toggleModal(true)}
      >
        {intl.formatMessage({
          id: 'dashboard.pipelineResource.createPipelineResourceButton',
          defaultMessage: 'Create PipelineResource'
        })}
      </Button>
    );

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineResources.error',
            defaultMessage: 'Error loading PipelineResources'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    return (
      <>
        {this.state.createdPipelineResource && (
          <InlineNotification
            kind="success"
            title={intl.formatMessage({
              id: 'dashboard.pipelineResources.createSuccess',
              defaultMessage: 'Successfully created PipelineResource'
            })}
            subtitle={
              <Link to={this.state.createdPipelineResource.url}>
                {this.state.createdPipelineResource.name}
              </Link>
            }
            lowContrast
          />
        )}
        <h1>PipelineResources</h1>
        <LabelFilter
          additionalButton={createPipelineResourceButton}
          filters={filters}
          handleAddFilter={getAddFilterHandler(this.props)}
          handleDeleteFilter={getDeleteFilterHandler(this.props)}
        />
        <PipelineResourcesModal
          open={this.state.showCreatePipelineResourceModal}
          handleCreatePipelineResource={this.handleCreatePipelineResourceClick}
          onClose={() => this.toggleModal(false)}
          onSuccess={this.handleCreatePipelineResourceSuccess}
          pipelineRef={this.props.pipelineName}
          namespace={selectedNamespace}
        />
        <PipelineResourcesList
          loading={loading}
          pipelineResources={pipelineResources}
          pipelineResourceActions={pipelineResourceActions}
          selectedNamespace={selectedNamespace}
        />
      </>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);
  const filters = getFilters(props.location);

  return {
    error: getPipelineResourcesErrorMessage(state),
    filters,
    loading: isFetchingPipelineResources(state),
    namespace,
    pipelineResources: getPipelineResources(state, { filters, namespace }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineResources
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineResources));
