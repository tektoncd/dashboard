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
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getStatus, getTitle, urls } from '@tektoncd/dashboard-utils';
import {
  FormattedDate,
  FormattedDuration,
  ResourceDetails,
  StatusIcon,
  Table
} from '@tektoncd/dashboard-components';
import {
  getProject,
  getProjectsErrorMessage,
  getSelectedNamespace,
  isWebSocketConnected
} from '../../reducers';
import { fetchProject } from '../../actions/projects';

export class ProjectContainer extends Component {
  componentDidMount() {
    const { match } = this.props;
    const { projectName: resourceName } = match.params;
    document.title = getTitle({
      page: 'Project',
      resourceName
    });
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match, webSocketConnected } = this.props;
    const { namespace, projectName } = match.params;
    const {
      match: prevMatch,
      webSocketConnected: prevWebSocketConnected
    } = prevProps;
    const {
      namespace: prevNamespace,
      projectName: prevProjectName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      projectName !== prevProjectName ||
      (webSocketConnected && prevWebSocketConnected === false)
    ) {
      this.fetchData();
    }
  }

  getAdditionalContent() {
    const { project, intl } = this.props;
    if (!project) {
      return null;
    }

    const buildHeaders = [
      {
        key: 'status',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.status',
          defaultMessage: 'Status'
        })
      },
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'duration',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.duration',
          defaultMessage: 'Duration'
        })
      }
    ];

    const resourceHeaders = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'value',
        header: 'value'
      }
    ];

    return (
      <>
        <Table
          title="Resources"
          headers={resourceHeaders}
          rows={[
            {
              id: 'event-listener',
              name: 'Event listener',
              value: (
                <Link
                  to={urls.eventListeners.byName({
                    namespace: project.metadata.namespace,
                    eventListenerName: project.metadata.name
                  })}
                  title={project.metadata.name}
                >
                  {project.metadata.name}
                </Link>
              )
            },
            {
              id: 'event-listener-service',
              name: 'Event listener service',
              value: project.status.eventListener.configuration.generatedName
            },
            {
              id: 'event-listener-address',
              name: 'Event listener address',
              value: project.status.eventListener.address.url
            },
            {
              id: 'trigger-template',
              name: 'Trigger template',
              value: (
                <Link
                  to={urls.triggerTemplates.byName({
                    namespace: project.metadata.namespace,
                    triggerTemplateName: project.metadata.name
                  })}
                  title={project.metadata.name}
                >
                  {project.metadata.name}
                </Link>
              )
            },
            {
              id: 'trigger-binding',
              name: 'Trigger binding',
              value: (
                <Link
                  to={urls.triggerBindings.byName({
                    namespace: project.metadata.namespace,
                    triggerBindingName: project.metadata.name
                  })}
                  title={project.metadata.name}
                >
                  {project.metadata.name}
                </Link>
              )
            }
          ]}
        />
        {project.status.builds && (
          <Table
            title="Builds"
            headers={buildHeaders}
            rows={Object.keys(project.status.builds).map(build => {
              console.log(project.status.builds[build].pipelineRun.startTime);
              const { lastTransitionTime, reason, status } = getStatus({
                status: project.status.builds[build].pipelineRun
              });
              let endTime = Date.now();
              if (status === 'False' || status === 'True') {
                endTime = new Date(lastTransitionTime).getTime();
              }
              return {
                id: build,
                name: (
                  <Link
                    to={urls.builds.byName({
                      namespace: project.metadata.namespace,
                      buildName: build
                    })}
                    title={build}
                  >
                    {build}
                  </Link>
                ),
                status: (
                  <div className="tkn--definition">
                    <div
                      className="tkn--status"
                      data-status={status}
                      data-reason={reason}
                    >
                      <StatusIcon reason={reason} status={status} />
                    </div>
                  </div>
                ),
                createdTime: (
                  <FormattedDate
                    date={project.status.builds[build].pipelineRun.startTime}
                    relative
                  />
                ),
                duration: (
                  <FormattedDuration
                    milliseconds={
                      endTime -
                      new Date(
                        project.status.builds[build].pipelineRun.startTime
                      ).getTime()
                    }
                  />
                )
              };
            })}
          />
        )}
      </>
    );
  }

  fetchData() {
    const { match } = this.props;
    const { namespace, projectName } = match.params;
    this.props.fetchProject({ name: projectName, namespace });
  }

  render() {
    const { error, project } = this.props;
    const additionalContent = this.getAdditionalContent();

    return (
      <ResourceDetails error={error} kind="Project" resource={project}>
        {additionalContent}
      </ResourceDetails>
    );
  }
}

ProjectContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace: namespaceParam, projectName } = match.params;

  const namespace = namespaceParam || getSelectedNamespace(state);
  const project = getProject(state, {
    name: projectName,
    namespace
  });
  return {
    error: getProjectsErrorMessage(state),
    project,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchProject
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ProjectContainer));
