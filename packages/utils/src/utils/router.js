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
  about() {
    return '/about';
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
      return byNamespace({
        path:
          '/pipelineruns?labelSelector=tekton.dev%2Fpipeline%3D:pipelineName'
      });
    },
    byName() {
      return byNamespace({
        path: '/pipelineruns/:pipelineRunName'
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
  serviceAccounts: {
    all() {
      return '/serviceaccounts';
    },
    byNamespace() {
      return byNamespace({ path: '/serviceaccounts' });
    },
    byName() {
      return byNamespace({ path: '/serviceaccounts/:serviceAccountName' });
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
      return byNamespace({
        path: '/taskruns?labelSelector=tekton.dev%2Ftask%3D:taskName'
      });
    },
    byClusterTask() {
      return '/taskruns?labelSelector=tekton.dev%2Ftask%3D:taskName';
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
  },
  eventListeners: {
    all() {
      return '/eventlisteners';
    },
    byNamespace() {
      return byNamespace({ path: '/eventlisteners' });
    },
    byName() {
      return byNamespace({ path: '/eventlisteners/:eventListenerName' });
    }
  },
  triggerTemplates: {
    all() {
      return '/triggertemplates';
    },
    byNamespace() {
      return byNamespace({ path: '/triggertemplates' });
    },
    byName() {
      return byNamespace({ path: '/triggertemplates/:triggerTemplateName' });
    }
  },
  triggerBindings: {
    all() {
      return '/triggerbindings';
    },
    byNamespace() {
      return byNamespace({ path: '/triggerbindings' });
    },
    byName() {
      return byNamespace({ path: '/triggerbindings/:triggerBindingName' });
    }
  },
  kubernetesResources: {
    all() {
      return '/:group/:version/:type';
    },
    byNamespace() {
      return byNamespace({ path: '/:group/:version/:type' });
    },
    cluster() {
      return '/:group/:version/:type/:name';
    },
    byName() {
      return byNamespace({ path: '/:group/:version/:type/:name' });
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
