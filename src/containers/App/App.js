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

import React from 'react';
import { hot } from 'react-hot-loader';
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';

import {
  Home,
  PipelineRun,
  PipelineRuns,
  Pipelines,
  Tasks,
  TaskRuns
} from '..';

import '../../components/App/App.scss';

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={Home} />
      <Redirect
        from="/pipelines/:pipelineName"
        exact
        to="/pipelines/:pipelineName/runs"
      />
      <Redirect from="/tasks/:taskName" exact to="/tasks/:taskName/runs" />
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
    </Switch>
  </Router>
);

export default hot(module)(App);
