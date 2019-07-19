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
import { hot } from 'react-hot-loader/root';
import {
  Redirect,
  Route,
  HashRouter as Router,
  Switch
} from 'react-router-dom';

import { Content } from 'carbon-components-react';

import {
  ClusterTasks,
  CustomResourceDefinition,
  Extension,
  Extensions,
  ImportResources,
  PipelineResource,
  PipelineResources,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  Secrets,
  SideNav,
  TaskRun,
  TaskRunList,
  TaskRuns,
  Tasks
} from '..';

import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { fetchExtensions } from '../../actions/extensions';
import { fetchNamespaces, selectNamespace } from '../../actions/namespaces';
import { getExtensions, getSelectedNamespace } from '../../reducers';
import { paths, urls } from '../../utils';

import '../../components/App/App.scss';

export /* istanbul ignore next */ class App extends Component {
  componentDidMount() {
    this.props.fetchExtensions();
    this.props.fetchNamespaces();
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const { extensions } = this.props;

    return (
      <Router>
        <>
          <Header>
            <Route path="*" component={Breadcrumbs} />
          </Header>
          <Route path={paths.byNamespace({ path: '/*' })}>
            {props => <SideNav {...props} />}
          </Route>

          <Content>
            <Switch>
              <Route path={paths.pipelines.all()} exact component={Pipelines} />
              <Route
                path={paths.pipelines.byNamespace()}
                exact
                component={Pipelines}
              />
              <Route path={paths.secrets.all()} exact component={Secrets} />
              <Route path={paths.tasks.all()} exact component={Tasks} />
              <Route path={paths.tasks.byNamespace()} exact component={Tasks} />
              <Route
                path={paths.clusterTasks.all()}
                exact
                component={ClusterTasks}
              />
              <Route path={paths.pipelineRuns.all()} component={PipelineRuns} />
              <Route
                path={paths.pipelineRuns.byNamespace()}
                component={PipelineRuns}
              />
              <Route
                path={paths.taskRuns.byNamespace()}
                exact
                component={TaskRunList}
              />
              <Route path={paths.taskRuns.byName()} exact component={TaskRun} />
              <Route
                path={paths.pipelineRuns.byPipeline()}
                exact
                component={PipelineRuns}
              />
              <Route path={paths.taskRuns.all()} component={TaskRunList} />
              <Route
                path={paths.taskRuns.byTask()}
                exact
                component={TaskRuns}
              />
              <Route
                path={paths.taskRuns.byClusterTask()}
                exact
                component={TaskRuns}
              />
              <Route
                path={paths.pipelineRuns.byName()}
                component={PipelineRun}
              />
              <Route
                path={paths.pipelineResources.all()}
                exact
                component={PipelineResources}
              />
              <Route
                path={paths.pipelineResources.byNamespace()}
                exact
                component={PipelineResources}
              />
              <Route
                path={paths.pipelineResources.byName()}
                exact
                component={PipelineResource}
              />
              <Route
                path={paths.importResources()}
                component={ImportResources}
              />
              <Route
                path={paths.extensions.all()}
                exact
                component={Extensions}
              />
              {extensions.map(({ displayName, name, source }) => (
                <Route
                  key={name}
                  path={paths.extensions.byName({ name })}
                  render={({ match }) => (
                    <Extension
                      displayName={displayName}
                      match={match}
                      source={source}
                    />
                  )}
                />
              ))}
              <Route
                path={paths.rawCRD.byNamespace()}
                exact
                component={CustomResourceDefinition}
              />
              <Route
                path={paths.rawCRD.cluster()}
                exact
                component={CustomResourceDefinition}
              />
              <Redirect to={urls.pipelines.all()} />
            </Switch>
          </Content>
        </>
      </Router>
    );
  }
}

App.defaultProps = {
  extensions: [],
  onUnload: () => {}
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state),
  namespace: getSelectedNamespace(state)
});

const mapDispatchToProps = {
  fetchExtensions,
  fetchNamespaces,
  selectNamespace
};

export default hot(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
