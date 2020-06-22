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
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import {
  Button,
  InlineLoading,
  InlineNotification
} from 'carbon-components-react';
import { PipelineRuns as PipelineRunsList } from '@tektoncd/dashboard-components';
import {
  getErrorMessage,
  getFilters,
  getStatus,
  getTitle,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';
import { Add16 as Add } from '@carbon/icons-react';

import { CreatePipelineRun, LabelFilter } from '..';
import { sortRunsByStartTime } from '../../utils';
import { fetchPipelineRuns } from '../../actions/pipelineRuns';

import {
  fetchedPipelineRunsContinueToken,
  getPipelineRuns,
  getPipelineRunsErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineRuns,
  isReadOnly,
  isWebSocketConnected
} from '../../reducers';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun
} from '../../api';

const initialState = {
  showCreatePipelineRunModal: false,
  createdPipelineRun: null,
  submitError: '',
  loadingPipelineRuns: false
};

export /* istanbul ignore next */ class PipelineRuns extends Component {
  constructor(props) {
    super(props);

    this.handleCreatePipelineRunSuccess = this.handleCreatePipelineRunSuccess.bind(
      this
    );

    this.state = initialState;
  }

  componentDidMount() {
    const { continueToken } = this.props;
    document.title = getTitle({ page: 'PipelineRuns' });
    if (!continueToken) {
      this.fetchPipelineRuns();
    }
  }

  componentDidUpdate(prevProps) {
    const { filters, namespace, webSocketConnected } = this.props;
    const {
      filters: prevFilters,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;

    if (namespace !== prevNamespace || !isEqual(filters, prevFilters)) {
      this.reset();
      this.fetchPipelineRuns(true);
    } else if (webSocketConnected && prevWebSocketConnected === false) {
      this.fetchPipelineRuns(true);
    }
  }

  cancel = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    cancelPipelineRun({ name, namespace });
  };

  deleteRun = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    deletePipelineRun({ name, namespace }).catch(error => {
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

  resetSuccess = () => {
    this.setState({ createdPipelineRun: false });
  };

  rerun = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    rerunPipelineRun(namespace, { pipelinerunname: name });
  };

  toggleModal = showCreatePipelineRunModal => {
    this.setState({ showCreatePipelineRunModal });
  };

  pipelineRunActions = () => {
    const { intl } = this.props;

    if (this.props.isReadOnly) {
      return [];
    }
    return [
      {
        actionText: intl.formatMessage({
          id: 'dashboard.cancelPipelineRun.actionText',
          defaultMessage: 'Stop'
        }),
        action: this.cancel,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return !isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.heading',
            defaultMessage: 'Stop PipelineRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.cancelPipelineRun.primaryText',
            defaultMessage: 'Stop PipelineRun'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.cancelPipelineRun.body',
                defaultMessage:
                  'Are you sure you would like to stop PipelineRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.actions.deleteButton',
          defaultMessage: 'Delete'
        }),
        action: this.deleteRun,
        danger: true,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        modalProperties: {
          danger: true,
          heading: intl.formatMessage({
            id: 'dashboard.deletePipelineRun.heading',
            defaultMessage: 'Delete PipelineRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.actions.deleteButton',
            defaultMessage: 'Delete'
          }),
          secondaryButtonText: intl.formatMessage({
            id: 'dashboard.modal.cancelButton',
            defaultMessage: 'Cancel'
          }),
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deletePipelineRun.body',
                defaultMessage:
                  'Are you sure you would like to delete PipelineRun {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      },
      {
        actionText: intl.formatMessage({
          id: 'dashboard.rerunPipelineRun.actionText',
          defaultMessage: 'Rerun'
        }),
        action: this.rerun
      }
    ];
  };

  handleCreatePipelineRunSuccess(newPipelineRun) {
    const {
      metadata: { namespace, name }
    } = newPipelineRun;
    const url = urls.pipelineRuns.byName({
      namespace,
      pipelineRunName: name
    });
    this.toggleModal(false);
    this.setState({ createdPipelineRun: { name, url } });
  }

  reset() {
    this.setState(initialState);
  }

  fetchPipelineRuns(filterApplied = false) {
    const { filters, namespace, limit } = this.props;
    let { continueToken } = this.props;
    if (filterApplied || continueToken !== 'DONE') {
      // reset token
      continueToken =
        filterApplied && continueToken === 'DONE' ? '' : continueToken;

      this.setState({ loadingPipelineRuns: true });
      this.props
        .fetchPipelineRuns({
          filters,
          namespace,
          limit,
          continueToken
        })
        .then(morePipelineRuns => {
          if (morePipelineRuns) {
            this.setState({ loadingPipelineRuns: false });
          }
        });
    }
  }

  render() {
    const {
      error,
      loading,
      namespace: selectedNamespace,
      pipelineRuns,
      continueToken,
      intl
    } = this.props;
    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.pipelineRuns.error',
            defaultMessage: 'Error loading PipelineRuns'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }
    const pipelineRunActions = this.pipelineRunActions();
    sortRunsByStartTime(pipelineRuns);

    const toolbarButtons = this.props.isReadOnly
      ? []
      : [
          {
            onClick: () => this.toggleModal(true),
            text: intl.formatMessage({
              id: 'dashboard.actions.createButton',
              defaultMessage: 'Create'
            }),
            icon: Add
          }
        ];

    return (
      <>
        {this.state.createdPipelineRun && (
          <InlineNotification
            kind="success"
            title={intl.formatMessage({
              id: 'dashboard.pipelineRuns.createSuccess',
              defaultMessage: 'Successfully created PipelineRun'
            })}
            subtitle={
              <Link to={this.state.createdPipelineRun.url}>
                {this.state.createdPipelineRun.name}
              </Link>
            }
            onCloseButtonClick={this.resetSuccess}
            lowContrast
          />
        )}
        {this.state.submitError && (
          <InlineNotification
            kind="error"
            title={intl.formatMessage({
              id: 'dashboard.error.title',
              defaultMessage: 'Error:'
            })}
            subtitle={getErrorMessage(this.state.submitError)}
            iconDescription={intl.formatMessage({
              id: 'dashboard.notification.clear',
              defaultMessage: 'Clear Notification'
            })}
            data-testid="errorNotificationComponent"
            onCloseButtonClick={this.props.clearNotification}
            lowContrast
          />
        )}
        <h1>PipelineRuns</h1>
        <LabelFilter {...this.props} />
        {!this.props.isReadOnly && (
          <CreatePipelineRun
            open={this.state.showCreatePipelineRunModal}
            onClose={() => this.toggleModal(false)}
            onSuccess={this.handleCreatePipelineRunSuccess}
            pipelineRef={this.props.pipelineName}
            namespace={selectedNamespace}
          />
        )}
        <PipelineRunsList
          loading={loading && !pipelineRuns.length}
          pipelineRuns={pipelineRuns}
          pipelineRunActions={pipelineRunActions}
          selectedNamespace={selectedNamespace}
          toolbarButtons={toolbarButtons}
        />

        {continueToken !== 'DONE' && (
          <div style={{ float: 'right' }}>
            {this.state.loadingPipelineRuns ? (
              <InlineLoading
                status="active"
                iconDescription="Active loading indicator"
                description="Loading PipelineRuns..."
              />
            ) : (
              <Button
                as="p"
                href="#"
                iconDescription="Load More Button"
                kind="ghost"
                onClick={() => this.fetchPipelineRuns()}
                size="default"
                type="button"
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </>
    );
  }
}

PipelineRuns.defaultProps = {
  filters: []
};

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = getFilters(props.location);
  const namespace = namespaceParam || getSelectedNamespace(state);

  const pipelineFilter =
    filters.find(filter => filter.indexOf('tekton.dev/pipeline=') !== -1) || '';
  const pipelineName = pipelineFilter.replace('tekton.dev/pipeline=', '');

  return {
    isReadOnly: isReadOnly(state),
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    namespace,
    filters,
    pipelineName,
    pipelineRuns: getPipelineRuns(state, {
      filters,
      namespace
    }),
    webSocketConnected: isWebSocketConnected(state),
    continueToken: fetchedPipelineRunsContinueToken(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineRuns));
