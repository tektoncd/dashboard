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
  HashRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';

import {
  Extension,
  Extensions,
  Home,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  Tasks,
  TaskRuns
} from '..';
import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { fetchExtensions } from '../../actions/extensions';
import { fetchNamespaces } from '../../actions/namespaces';
import { getExtensions } from '../../reducers';

import '../../components/App/App.scss';

export /* istanbul ignore next */ class App extends Component {
  componentDidMount() {
    this.props.fetchExtensions();
    this.props.fetchNamespaces();
  }

  render() {
    const { extensions } = this.props;

    return (
      <Router>
        <>
          <Header>
            <Route path="*" component={Breadcrumbs} />
          </Header>
          <main>
            <Switch>
              <Route path="/" exact component={Home} />
              <Redirect
                from="/pipelines/:pipelineName"
                exact
                to="/pipelines/:pipelineName/runs"
              />
              <Redirect
                from="/tasks/:taskName"
                exact
                to="/tasks/:taskName/runs"
              />
              <Route path="/pipelines" exact component={Pipelines} />
              <Route path="/tasks" exact component={Tasks} />
              <Route
                path="/pipelines/:pipelineName/runs"
                exact
                component={PipelineRuns}
              />
              <Route path="/tasks/:taskName/runs" exact component={TaskRuns} />
              <Route
                path="/pipelines/:pipelineName/runs/:pipelineRunName"
                component={PipelineRun}
              />
              <Route path="/extensions" exact component={Extensions} />
              {extensions
                .filter(({ displayName }) => !!displayName)
                .map(({ displayName, name, source }) => (
                  <Route
                    key={name}
                    path={`/extensions/${name}`}
                    render={({ match }) => (
                      <Extension
                        displayName={displayName}
                        match={match}
                        source={source}
                      />
                    )}
                  />
                ))}
            </Switch>
          </main>
        </>
      </Router>
    );
  }
}

App.defaultProps = {
  extensions: []
};

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state)
});

const mapDispatchToProps = {
  fetchExtensions,
  fetchNamespaces
};

export default hot(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
