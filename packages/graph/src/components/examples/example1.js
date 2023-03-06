/*
Copyright 2022-2023 The Tekton Authors
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
/* istanbul ignore file */

function getNodeData({ height, type, width }) {
  return [
    {
      id: 'skaffold-unit-tests',
      status: 'success-warning',
      title: 'skaffold-unit-tests',
      height,
      width,
      type
    },
    {
      id: 'build-skaffold-web',
      status: 'success',
      title: 'build-skaffold-web',
      height,
      width,
      type
    },
    {
      id: 'build-skaffold-app',
      status: 'success',
      title: 'build-skaffold-app',
      height,
      width,
      type
    },
    {
      id: 'deploy-app',
      status: 'success',
      title: 'deploy-app',
      height,
      width,
      type
    },
    {
      id: 'deploy-web',
      status: 'failed',
      title: 'deploy-web',
      height,
      width,
      type
    }
    // { id: "start", title: "start", height: 50, width: 50 },
    // { id: "end", title: "end", height: 50, width: 50 }
  ];
}

function getEdgeData() {
  return [
    { id: '1', source: 'skaffold-unit-tests', target: 'build-skaffold-app' },
    { id: '2', source: 'skaffold-unit-tests', target: 'build-skaffold-web' },
    { id: '3', source: 'build-skaffold-app', target: 'deploy-app' },
    { id: '4', source: 'build-skaffold-web', target: 'deploy-web' }
    // { id: "5", source: "start", target: "skaffold-unit-tests" },
    // { id: "6", source: "deploy-app", target: "end" },
    // { id: "7", source: "deploy-web", target: "end" }
  ];
}

export default function getExampleData({ height, type = 'card', width }) {
  return {
    edges: getEdgeData(),
    nodes: getNodeData({ height, type, width })
  };
}
