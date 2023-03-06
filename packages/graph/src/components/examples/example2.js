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
      id: 'git-clone',
      status: 'success',
      title: 'git-clone',
      height,
      width,
      type
    },
    {
      id: 'precheck',
      status: 'success',
      title: 'precheck',
      height,
      width,
      type
    },
    {
      id: 'build',
      status: 'success',
      title: 'build',
      height,
      width,
      type
    },
    {
      id: 'publish-images',
      status: 'success',
      title: 'publish-images',
      height,
      width,
      type
    },
    {
      id: 'publish-to-bucket',
      status: 'success',
      title: 'publish-to-bucket',
      height,
      width,
      type
    },
    {
      id: 'publish-to-bucket-latest',
      status: 'success',
      title: 'publish-to-bucket-latest',
      height,
      width,
      type
    },
    {
      id: 'report-bucket',
      status: 'success',
      title: 'report-bucket',
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
    { id: '1', source: 'git-clone', target: 'precheck' },
    { id: '2', source: 'precheck', target: 'build' },
    { id: '3', source: 'build', target: 'publish-images' },
    { id: '4', source: 'publish-images', target: 'publish-to-bucket' },
    { id: '5', source: 'publish-images', target: 'publish-to-bucket-latest' },
    { id: '6', source: 'publish-to-bucket', target: 'report-bucket' }
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
