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
import {
  Button,
  Form,
  InlineNotification,
  Link as ReactLink,
  Search,
  StructuredListSkeleton,
  Tag
} from 'carbon-components-react';
import { PipelineRuns as PipelineRunsList } from '@tektoncd/dashboard-components';
import {
  getErrorMessage,
  getStatus,
  isRunning,
  urls
} from '@tektoncd/dashboard-utils';
import Add from '@carbon/icons-react/lib/add/16';

import { CreatePipelineRun } from '..';
import './PipelineRuns.scss';

import { sortRunsByStartTime } from '../../utils';
import { fetchPipelineRuns } from '../../actions/pipelineRuns';

import {
  getPipelineRuns,
  getPipelineRunsByPipelineName,
  getPipelineRunsErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineRuns,
  isWebSocketConnected
} from '../../reducers';
import { cancelPipelineRun } from '../../api';

const initialState = {
  showCreatePipelineRunModal: false,
  createdPipelineRun: null,
  validFilter: {
    isValid: true,
    filterMessage: null,
    url: '',
    urlMessage: ''
  }
};

function arrayUnique(arr) {
  return arr.filter(function unique(item, index) {
    return arr.indexOf(item) >= index;
  });
}

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

  componentDidUpdate(prevProps, prevState) {
    const { match, namespace, webSocketConnected } = this.props;
    const { filters } = this.state;
    const { filters: prevFilters } = prevState;
    const { pipelineName } = match.params;
    const {
      match: prevMatch,
      namespace: prevNamespace,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const { pipelineName: prevPipelineName } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      pipelineName !== prevPipelineName ||
      filters !== prevFilters ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.reset();
      this.fetchPipelineRuns();
    }
  }

  cancel = pipelineRun => {
    const { name, namespace } = pipelineRun.metadata;
    cancelPipelineRun({ name, namespace });
  };

  toggleModal = showCreatePipelineRunModal => {
    this.setState({ showCreatePipelineRunModal });
  };

  handleChange = event => {
    const inputValue = event.target.value;
    this.setState({
      currentFilterValue: inputValue
    });
  };

  pipelineRunActions = () => {
    const { intl } = this.props;
    return [
      {
        actionText: 'Cancel',
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
            id: 'dashboard.cancelPipelineRun.cancelButton',
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
      }
    ];
  };

  handleAddFilter = event => {
    const { intl } = this.props;
    event.preventDefault();
    const currentURL = this.props.match.url;
    const { currentFilterValue = '' } = this.state;
    const filterRegex = '([a-z0-9A-Z-_./]:[a-z0-9A-Z-_.],?)+';
    const filterValue = currentFilterValue.replace(/\s/g, '');
    if (!filterValue.match(filterRegex)) {
      this.setState({
        validFilter: {
          isValid: false,
          filterMessage: intl.formatMessage({
            id: 'dashboard.pipelineRuns.invalidFilter',
            defaultMessage:
              'Filters must be of the format labelKey:labelValue and contain accepted label characters'
          }),
          url:
            'https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set',
          urlMessage: 'See the Kubernetes Label documentation for valid syntax'
        }
      });
      return;
    }
    const colonToEqualsFilters = filterValue.replace(/:/g, '=');
    let currentFiltersArray = colonToEqualsFilters.split(',');
    currentFiltersArray = arrayUnique(currentFiltersArray);
    if (this.props.filters.includes(currentFiltersArray[0])) {
      this.setState({
        validFilter: {
          isValid: false,
          filterMessage: intl.formatMessage({
            id: 'dashboard.pipelineRuns.duplicateFilter',
            defaultMessage: 'No duplicate filters allowed'
          }),
          url: '',
          urlMessage: ''
        }
      });
      return;
    }
    const newQueryParams = `?${new URLSearchParams({
      labelSelector: this.props.filters.concat(currentFiltersArray)
    }).toString()}`;
    const browserURL = currentURL.concat(newQueryParams);
    this.props.history.push(browserURL);
    this.resetCurrentFilterValue();
    this.fetchPipelineRuns();
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

  handleCloseFilterError = () => {
    this.setState({
      validFilter: {
        isValid: true,
        filterMessage: null,
        url: '',
        urlMessage: ''
      }
    });
  };

  resetCurrentFilterValue() {
    this.setState({
      validFilter: {
        isValid: true,
        filterMessage: null,
        url: '',
        urlMessage: ''
      },
      currentFilterValue: ''
    });
  }

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
    const { match, namespace } = this.props;
    const { pipelineName } = match.params;
    this.props.fetchPipelineRuns({
      pipelineName,
      namespace
    });
  }

  render() {
    const {
      match,
      error,
      loading,
      namespace: selectedNamespace,
      pipelineRuns,
      intl
    } = this.props;
    const { pipelineName } = match.params;
    const { currentFilterValue, validFilter } = this.state;
    const { filterMessage, isValid, url, urlMessage } = validFilter;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

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
        {!isValid && (
          <InlineNotification
            lowContrast
            kind="error"
            title={filterMessage}
            subtitle=""
            role="alert"
            onCloseButtonClick={this.handleCloseFilterError}
          >
            <ReactLink id="labelDocsLink" href={url}>
              {urlMessage}
            </ReactLink>
          </InlineNotification>
        )}
        <Form onSubmit={this.handleAddFilter} autoComplete="on">
          <div className="search-bar">
            <Search
              placeHolderText={intl.formatMessage({
                id: 'dashboard.pipelineRuns.searchPlaceholder',
                defaultMessage:
                  'Input a label filter of the format labelKey:labelValue'
              })}
              className="search"
              labelText={intl.formatMessage({
                id: 'dashboard.pipelineRuns.searchPlaceholder',
                defaultMessage:
                  'Input a label filter of the format labelKey:labelValue'
              })}
              onChange={this.handleChange}
              value={currentFilterValue}
              data-testid="filter-search-bar"
              id="filter-search"
              name="filter-search"
            />
            <Button
              className="add-filter-button"
              iconDescription="Add filter"
              renderIcon={Add}
              kind="ghost"
              type="submit"
            >
              Add filter
            </Button>
            <Button
              className="create-pipelinerun-button"
              iconDescription="Create PipelineRun"
              renderIcon={Add}
              type="button"
              onClick={() => this.toggleModal(true)}
            >
              Create PipelineRun
            </Button>
          </div>
        </Form>
        <div className="filters">
          <div className="filters-title">Filters:</div>
          {this.props.filters.map(filter => (
            <Tag
              type="blue"
              filter
              onClick={() => this.handleDeleteFilter(filter)}
              key={filter}
            >
              {filter.replace(/=/g, ':')}
            </Tag>
          ))}
        </div>
        <CreatePipelineRun
          open={this.state.showCreatePipelineRunModal}
          onClose={() => this.toggleModal(false)}
          onSuccess={this.handleCreatePipelineRunSuccess}
          pipelineRef={pipelineName}
          namespace={selectedNamespace}
        />
        <PipelineRunsList
          pipelineName={pipelineName}
          selectedNamespace={selectedNamespace}
          pipelineRuns={pipelineRuns}
          pipelineRunActions={pipelineRunActions}
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
  const { namespace: namespaceParam, pipelineName } = props.match.params;
  const filters = fetchFilters(props.location.search);
  const namespace = namespaceParam || getSelectedNamespace(state);
  return {
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    namespace,
    filters,
    pipelineRuns: pipelineName
      ? getPipelineRunsByPipelineName(state, {
          filters,
          name: props.match.params.pipelineName,
          namespace
        })
      : getPipelineRuns(state, {
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
