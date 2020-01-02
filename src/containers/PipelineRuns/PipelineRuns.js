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
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { Button, InlineNotification } from 'carbon-components-react';
import {
  LabelFilter,
  PipelineRuns as PipelineRunsList
} from '@tektoncd/dashboard-components';
import {
  getErrorMessage,
  getStatus,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';
import Add from '@carbon/icons-react/lib/add/16';

import { CreatePipelineRun } from '..';

import { sortRunsByStartTime } from '../../utils';
import { fetchPipelineRuns } from '../../actions/pipelineRuns';

import {
  getPipelineRuns,
  getPipelineRunsErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineRuns,
  isWebSocketConnected
} from '../../reducers';
import {
  cancelPipelineRun,
  deletePipelineRun,
  rerunPipelineRun
} from '../../api';

const initialState = {
  showCreatePipelineRunModal: false,
  createdPipelineRun: null
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
    this.fetchPipelineRuns();
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
      this.fetchPipelineRuns();
    } else if (webSocketConnected && prevWebSocketConnected === false) {
      this.fetchPipelineRuns();
    }
  }

  cancel = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    cancelPipelineRun({ name, namespace });
  };

  deleteRun = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    deletePipelineRun({ name, namespace });
  };

  rerun = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    rerunPipelineRun(namespace, { pipelinerunname: name });
  };

  toggleModal = showCreatePipelineRunModal => {
    this.setState({ showCreatePipelineRunModal });
  };

  handleAddFilter = labelFilters => {
    const queryParams = `?${new URLSearchParams({
      labelSelector: labelFilters
    }).toString()}`;

    const currentURL = this.props.match.url;
    const browserURL = currentURL.concat(queryParams);
    this.props.history.push(browserURL);
  };

  handleDeleteFilter = filter => {
    const currentQueryParams = new URLSearchParams(this.props.location.search);
    const labelFilters = currentQueryParams.getAll('labelSelector');
    const labelFiltersArray = labelFilters.toString().split(',');
    const index = labelFiltersArray.indexOf(filter);
    labelFiltersArray.splice(index, 1);

    const currentURL = this.props.match.url;
    if (labelFiltersArray.length === 0) {
      this.props.history.push(currentURL);
    } else {
      const newQueryParams = `?${new URLSearchParams({
        labelSelector: labelFiltersArray
      }).toString()}`;
      const browserURL = currentURL.concat(newQueryParams);
      this.props.history.push(browserURL);
    }
  };

  pipelineRunActions = () => {
    const { intl } = this.props;
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
          id: 'dashboard.deletePipelineRun.actionText',
          defaultMessage: 'Delete'
        }),
        action: this.deleteRun,
        disable: resource => {
          const { reason, status } = getStatus(resource);
          return isRunning(reason, status);
        },
        modalProperties: {
          heading: intl.formatMessage({
            id: 'dashboard.deletePipelineRun.heading',
            defaultMessage: 'Delete PipelineRun'
          }),
          primaryButtonText: intl.formatMessage({
            id: 'dashboard.deletePipelineRun.primaryText',
            defaultMessage: 'Delete PipelineRun'
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

  fetchPipelineRuns() {
    const { filters, namespace } = this.props;
    this.props.fetchPipelineRuns({
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
      pipelineRuns,
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

    const createPipelineRunButton = (
      <Button
        iconDescription={intl.formatMessage({
          id: 'dashboard.pipelineRuns.createPipelineRunTitle',
          defaultMessage: 'Create PipelineRun'
        })}
        renderIcon={Add}
        type="button"
        onClick={() => this.toggleModal(true)}
      >
        {intl.formatMessage({
          id: 'dashboard.pipelineRuns.createPipelineRunButton',
          defaultMessage: 'Create PipelineRun'
        })}
      </Button>
    );

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
            lowContrast
          />
        )}
        <h1>PipelineRuns</h1>
        <LabelFilter
          additionalButton={createPipelineRunButton}
          filters={filters}
          handleAddFilter={this.handleAddFilter}
          handleDeleteFilter={this.handleDeleteFilter}
        />
        <CreatePipelineRun
          open={this.state.showCreatePipelineRunModal}
          onClose={() => this.toggleModal(false)}
          onSuccess={this.handleCreatePipelineRunSuccess}
          pipelineRef={this.props.pipelineName}
          namespace={selectedNamespace}
        />
        <PipelineRunsList
          loading={loading}
          pipelineRuns={pipelineRuns}
          pipelineRunActions={pipelineRunActions}
          selectedNamespace={selectedNamespace}
        />
      </>
    );
  }
}

PipelineRuns.defaultProps = {
  filters: []
};

export function fetchFilters(searchQuery) {
  const queryParams = new URLSearchParams(searchQuery);
  let filters = [];
  queryParams.forEach(function filterValueSplit(value) {
    filters = value.split(',');
  });
  return filters;
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam } = props.match.params;
  const filters = fetchFilters(props.location.search);
  const namespace = namespaceParam || getSelectedNamespace(state);

  const pipelineFilter =
    filters.find(filter => filter.indexOf('tekton.dev/pipeline=') !== -1) || '';
  const pipelineName = pipelineFilter.replace('tekton.dev/pipeline=', '');

  return {
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    namespace,
    filters,
    pipelineName,
    pipelineRuns: getPipelineRuns(state, {
      filters,
      namespace
    }),
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineRuns));
