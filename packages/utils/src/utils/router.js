/*
Copyright 2019-2024 The Tekton Authors
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
import { generatePath } from 'react-router-dom-v5-compat';
import { labels } from './constants';

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
  customRuns: {
    all() {
      return '/customruns';
    },
    byName() {
      return byNamespace({ path: '/customruns/:runName' });
    },
    byNamespace() {
      return byNamespace({ path: '/customruns' });
    },
    create() {
      return '/customruns/create';
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
  importResources() {
    return '/importresources';
  },
  interceptors: {
    all() {
      return '/interceptors';
    },
    byName() {
      return byNamespace({ path: '/interceptors/:interceptorName' });
    },
    byNamespace() {
      return byNamespace({ path: '/interceptors' });
    }
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
    all() {
      return '/:type';
    },
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

const urls = reducer(paths);

function filteredURL({ baseURL, label, name }) {
  const labelSelector = `${label}=${name}`;
  const searchParams = new URLSearchParams({ labelSelector }).toString();
  return `${baseURL}?${searchParams}`;
}

urls.pipelineRuns.byPipeline = ({ namespace, pipelineName: name }) => {
  const baseURL = urls.pipelineRuns.byNamespace({ namespace });
  return filteredURL({ baseURL, label: labels.PIPELINE, name });
};

urls.taskRuns.byClusterTask = ({ taskName: name }) => {
  const baseURL = urls.taskRuns.all();
  return filteredURL({ baseURL, label: labels.CLUSTER_TASK, name });
};

urls.taskRuns.byTask = ({ namespace, taskName: name }) => {
  const baseURL = urls.taskRuns.byNamespace({ namespace });
  return filteredURL({ baseURL, label: labels.TASK, name });
};

export { urls };
