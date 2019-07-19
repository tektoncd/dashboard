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
import { generatePath } from 'react-router-dom';

function byNamespace({ path = '' } = {}) {
  return `/namespaces/:namespace${path}`;
}

export const paths = {
  clusterTasks: {
    all() {
      return '/clustertasks';
    }
  },
  extensions: {
    all() {
      return '/extensions';
    },
    byName({ name }) {
      return `/extensions/${name}`;
    }
  },
  importResources() {
    return '/importresources';
  },
  byNamespace,
  pipelineResources: {
    all() {
      return '/pipelineresources';
    },
    byNamespace() {
      return byNamespace({ path: '/pipelineresources' });
    },
    byName() {
      return byNamespace({ path: '/pipelineresources/:pipelineResourceName' });
    }
  },
  pipelineRuns: {
    all() {
      return '/pipelineruns';
    },
    byNamespace() {
      return byNamespace({ path: '/pipelineruns' });
    },
    byPipeline() {
      return byNamespace({ path: '/pipelines/:pipelineName/runs' });
    },
    byName() {
      return byNamespace({
        path: '/pipelines/:pipelineName/runs/:pipelineRunName'
      });
    }
  },
  pipelines: {
    all() {
      return '/pipelines';
    },
    byNamespace() {
      return byNamespace({ path: '/pipelines' });
    }
  },
  rawCRD: {
    cluster() {
      return '/:type/:name';
    },
    byNamespace() {
      return byNamespace({ path: '/:type/:name' });
    }
  },
  secrets: {
    all() {
      return '/secrets';
    }
  },
  taskRuns: {
    all() {
      return '/taskruns';
    },
    byNamespace() {
      return byNamespace({ path: '/taskruns' });
    },
    byTask() {
      return byNamespace({ path: '/:taskType(tasks)/:taskName/runs' });
    },
    byClusterTask() {
      return '/:taskType(clustertasks)/:taskName/runs';
    },
    byName() {
      return byNamespace({ path: '/taskruns/:taskRunName' });
    }
  },
  tasks: {
    all() {
      return '/tasks';
    },
    byNamespace() {
      return byNamespace({ path: '/tasks' });
    }
  }
};

const reducer = target =>
  Object.keys(target).reduce((accumulator, name) => {
    const pattern = target[name];
    accumulator[name] =
      typeof pattern === 'function'
        ? params => generatePath(pattern(params), params)
        : reducer(pattern);
    return accumulator;
  }, {});

export const urls = reducer(paths);
