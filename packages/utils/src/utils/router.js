/*
Copyright 2019-2021 The Tekton Authors
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
  about() {
    return '/about';
  },
  byNamespace,
  clusterTasks: {
    all() {
      return '/clustertasks';
    }
  },
  clusterInterceptors: {
    all() {
      return '/clusterinterceptors';
    },
    byName: function byName() {
      return '/clusterinterceptors/:clusterInterceptorName';
    }
  },
  clusterTriggerBindings: {
    all() {
      return '/clustertriggerbindings';
    },
    byName: function byName() {
      return '/clustertriggerbindings/:clusterTriggerBindingName';
    }
  },
  conditions: {
    all() {
      return '/conditions';
    },
    byName() {
      return byNamespace({
        path: '/conditions/:conditionName'
      });
    },
    byNamespace() {
      return byNamespace({ path: '/conditions' });
    }
  },
  eventListeners: {
    all() {
      return '/eventlisteners';
    },
    byName() {
      return byNamespace({ path: '/eventlisteners/:eventListenerName' });
    },
    byNamespace() {
      return byNamespace({ path: '/eventlisteners' });
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
  kubernetesResources: {
    all() {
      return '/:group/:version/:type';
    },
    byName() {
      return byNamespace({ path: '/:group/:version/:type/:name' });
    },
    byNamespace() {
      return byNamespace({ path: '/:group/:version/:type' });
    },
    cluster() {
      return '/:group/:version/:type/:name';
    }
  },
  pipelineResources: {
    all() {
      return '/pipelineresources';
    },
    byName() {
      return byNamespace({ path: '/pipelineresources/:pipelineResourceName' });
    },
    byNamespace() {
      return byNamespace({ path: '/pipelineresources' });
    },
    create() {
      return '/pipelineresources/create';
    }
  },
  pipelineRuns: {
    all() {
      return '/pipelineruns';
    },
    byName() {
      return byNamespace({
        path: '/pipelineruns/:pipelineRunName'
      });
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
    create() {
      return '/pipelineruns/create';
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
    byNamespace() {
      return byNamespace({ path: '/:type/:name' });
    },
    cluster() {
      return '/:type/:name';
    }
  },
  settings() {
    return '/settings';
  },
  taskRuns: {
    all() {
      return '/taskruns';
    },
    byName() {
      return byNamespace({ path: '/taskruns/:taskRunName' });
    },
    byNamespace() {
      return byNamespace({ path: '/taskruns' });
    },
    byClusterTask() {
      return '/taskruns?labelSelector=tekton.dev%2FclusterTask%3D:taskName';
    },
    byTask() {
      return byNamespace({
        path: '/taskruns?labelSelector=tekton.dev%2Ftask%3D:taskName'
      });
    },
    create() {
      return '/taskruns/create';
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
  triggerBindings: {
    all() {
      return '/triggerbindings';
    },
    byName() {
      return byNamespace({ path: '/triggerbindings/:triggerBindingName' });
    },
    byNamespace() {
      return byNamespace({ path: '/triggerbindings' });
    }
  },
  triggers: {
    all() {
      return '/triggers';
    },
    byName() {
      return byNamespace({ path: '/triggers/:triggerName' });
    },
    byNamespace() {
      return byNamespace({ path: '/triggers' });
    }
  },
  triggerTemplates: {
    all() {
      return '/triggertemplates';
    },
    byName() {
      return byNamespace({ path: '/triggertemplates/:triggerTemplateName' });
    },
    byNamespace() {
      return byNamespace({ path: '/triggertemplates' });
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
