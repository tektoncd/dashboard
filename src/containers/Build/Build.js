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

import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getTitle } from '@tektoncd/dashboard-utils';
import { ResourceDetails, Table } from '@tektoncd/dashboard-components';
import {
  getBuild,
  getBuildsErrorMessage,
  getSelectedNamespace,
  isWebSocketConnected
} from '../../reducers';
import { fetchBuild } from '../../actions/builds';

export class BuildContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { buildName: resourceName } = match.params;
    document.title = getTitle({
      page: 'Build',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, buildName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      buildName: prevBuildName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      buildName !== prevBuildName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  getAdditionalContent() {
    const { build, intl } = this.props;
    if (!build || !build.spec.params) {
      return null;
    }

    const headers = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'default',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.default',
          defaultMessage: 'Default'
        })
      },
      {
        key: 'type',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.type',
          defaultMessage: 'Type'
        })
      }
    ];

    const rows = build.spec.params.map(
      ({ name, default: defaultValue, type = 'string' }) => ({
        id: name,
        name,
        default: defaultValue,
        type
      })
    );

    return (
      <Table
        title={intl.formatMessage({
          id: 'dashboard.paramaters.title',
          defaultMessage: 'Parameters'
        })}
        headers={headers}
        rows={rows}
      />
    );
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, buildName } = match.params;
    this.props.fetchBuild({ name: buildName, namespace });
  }

  render() {
    const { error, build } = this.props;
    const additionalContent = this.getAdditionalContent();

    return (
      <ResourceDetails error={error} kind="Build" resource={build}>
        {additionalContent}
      </ResourceDetails>
    );
  }
}

BuildContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      buildName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace: namespaceParam, buildName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);
  const build = getBuild(state, {
    name: buildName,
    namespace
  });
  return {
    error: getBuildsErrorMessage(state),
    build,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchBuild
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BuildContainer));
