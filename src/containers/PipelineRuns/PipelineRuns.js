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
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';
import { PipelineRuns as PipelineRunsList } from '@tektoncd/dashboard-components';
import { getErrorMessage, urls } from '@tektoncd/dashboard-utils';
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
  isFetchingPipelineRuns
} from '../../reducers';
import { cancelPipelineRun } from '../../api';

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
    const { match, namespace } = this.props;
    const { pipelineName } = match.params;
    const { match: prevMatch, namespace: prevNamespace } = prevProps;
    const { pipelineName: prevPipelineName } = prevMatch.params;

    if (namespace !== prevNamespace || pipelineName !== prevPipelineName) {
      this.reset();
      this.fetchPipelineRuns();
    }
  }

  toggleModal = showCreatePipelineRunModal => {
    this.setState({ showCreatePipelineRunModal });
  };

  handleCreatePipelineRunSuccess(newPipelineRun) {
    const {
      metadata: { namespace, name },
      spec: {
        pipelineRef: { name: pipelineName }
      }
    } = newPipelineRun;
    const url = urls.pipelineRuns.byName({
      namespace,
      pipelineName,
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
            id: 'dashboard.pipelineRuns.error'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    sortRunsByStartTime(pipelineRuns);

    return (
      <>
        {this.state.createdPipelineRun && (
          <InlineNotification
            kind="success"
            title="Successfully created PipelineRun"
            subtitle={
              <Link to={this.state.createdPipelineRun.url}>
                {this.state.createdPipelineRun.name}
              </Link>
            }
            lowContrast
          />
        )}
        <Button
          className="create-pipelinerun-button"
          iconDescription="Create PipelineRun"
          renderIcon={Add}
          onClick={() => this.toggleModal(true)}
        >
          Create PipelineRun
        </Button>
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
          cancelPipelineRun={cancelPipelineRun}
        />
      </>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { namespace: namespaceParam, pipelineName } = props.match.params;
  const namespace = namespaceParam || getSelectedNamespace(state);

  return {
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    namespace,
    pipelineRuns: pipelineName
      ? getPipelineRunsByPipelineName(state, {
          name: props.match.params.pipelineName,
          namespace
        })
      : getPipelineRuns(state, { namespace })
  };
}

const mapDispatchToProps = {
  fetchPipelineRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PipelineRuns));
