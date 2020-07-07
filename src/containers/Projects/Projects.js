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
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash.isequal';
import { Add16 as Add } from '@carbon/icons-react';
import {
  getErrorMessage,
  getFilters,
  getTitle,
  urls
} from '@tektoncd/dashboard-utils';
import {
  FormattedDate,
  RunDropdown,
  Table
} from '@tektoncd/dashboard-components';
import { InlineNotification } from 'carbon-components-react';

import { CreateProject, LabelFilter } from '..';
import { fetchProjects } from '../../actions/projects';
import {
  getProjects,
  getProjectsErrorMessage,
  getSelectedNamespace,
  isFetchingProjects,
  isWebSocketConnected
} from '../../reducers';
import { deleteProject } from '../../api';

const initialState = {
  showCreateProject: false,
  createdTaskRun: null,
  submitError: ''
};

export class Projects extends Component {
  constructor(props) {
    super(props);

    // this.handleCreateTaskRunSuccess = this.handleCreateTaskRunSuccess.bind(
    //   this
    // );

    this.state = initialState;
  }

  componentDidMount() {
    document.title = getTitle({ page: 'Projects' });
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

  toggleModal = showCreateProjectModal => {
    this.setState({ showCreateProjectModal });
  };

  deleteProject = project => {
    const { name, namespace } = project.metadata;
    deleteProject({ name, namespace }).catch(error => {
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

  projectActions = () => {
    const { intl } = this.props;

    return [
      {
        actionText: 'Delete',
        action: this.deleteProject,
        danger: true,
        modalProperties: {
          danger: true,
          heading: 'Delete TaskRun',
          primaryButtonText: 'Delete',
          secondaryButtonText: 'Cancel',
          body: resource =>
            intl.formatMessage(
              {
                id: 'dashboard.deleteProject.body',
                defaultMessage:
                  'Are you sure you would like to delete Project {name}?'
              },
              { name: resource.metadata.name }
            )
        }
      }
    ];
  };

  fetchData() {
    const { filters, namespace } = this.props;
    this.props.fetchProjects({
      filters,
      namespace
    });
  }

  render() {
    const {
      error,
      projects,
      loading,
      intl,
      namespace: selectedNamespace
    } = this.props;

    const headers = [
      {
        key: 'name',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.name',
          defaultMessage: 'Name'
        })
      },
      {
        key: 'namespace',
        header: 'Namespace'
      },
      {
        key: 'ingressURL',
        header: 'Ingress URL'
      },
      {
        key: 'serviceAccount',
        header: 'Service account'
      },
      {
        key: 'createdTime',
        header: intl.formatMessage({
          id: 'dashboard.tableHeader.createdTime',
          defaultMessage: 'Created'
        })
      },
      {
        key: 'actions',
        header: ''
      }
    ];

    const projectActions = this.projectActions();

    const projectsFormatted = projects.map(project => ({
      id: project.metadata.uid,
      name: (
        <Link
          to={urls.projects.byName({
            namespace: project.metadata.namespace,
            projectName: project.metadata.name
          })}
          title={project.metadata.name}
        >
          {project.metadata.name}
        </Link>
      ),
      namespace: project.metadata.namespace,
      ingressURL: project.spec.ingress ? project.spec.ingress.host : null,
      serviceAccount: project.spec.serviceAccountName,
      createdTime: (
        <FormattedDate date={project.metadata.creationTimestamp} relative />
      ),
      actions: <RunDropdown items={projectActions} resource={project} />
    }));

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title={intl.formatMessage({
            id: 'dashboard.conditions.errorLoading',
            defaultMessage: 'Error loading Projects'
          })}
          subtitle={getErrorMessage(error)}
        />
      );
    }

    const toolbarButtons = [
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
        <h1>Projects</h1>
        <LabelFilter {...this.props} />
        <CreateProject
          open={this.state.showCreateProjectModal}
          onClose={() => this.toggleModal(false)}
          onSuccess={() => this.toggleModal(false)}
          namespace={selectedNamespace}
        />
        <Table
          headers={headers}
          rows={projectsFormatted}
          loading={loading && !projectsFormatted.length}
          toolbarButtons={toolbarButtons}
          selectedNamespace={selectedNamespace}
          emptyTextAllNamespaces={intl.formatMessage(
            {
              id: 'dashboard.emptyState.allNamespaces',
              defaultMessage: 'No {kind} in any namespace.'
            },
            { kind: 'Projects' }
          )}
          emptyTextSelectedNamespace={intl.formatMessage(
            {
              id: 'dashboard.emptyState.selectedNamespace',
              defaultMessage: 'No {kind} in namespace {selectedNamespace}'
            },
            { kind: 'Projects', selectedNamespace }
          )}
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
    error: getProjectsErrorMessage(state),
    filters,
    projects: getProjects(state, { filters, namespace }),
    loading: isFetchingProjects(state),
    namespace,
    webSocketConnected: isWebSocketConnected(state)
  };
}

const mapDispatchToProps = {
  fetchProjects
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Projects));
