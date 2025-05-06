/*
Copyright 2019-2025 The Tekton Authors
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
/* eslint-disable import/extensions */
import { generatePath } from 'react-router-dom';
// Include .js extension in import to solve ES-modules and CommonJS
// problem when importing dashboard-utils
import { labels } from './constants.js';

function byNamespace({ path = '' } = {}) {
  return `/namespaces/:namespace${path}`;
}

export const paths = {
  about() {
    return '/about';
  },
  byNamespace,
  clusterInterceptors: {
    all() {
      return '/clusterinterceptors';
    },
    byName() {
      return '/clusterinterceptors/:name';
    }
  },
  clusterTriggerBindings: {
    all() {
      return '/clustertriggerbindings';
    },
    byName() {
      return '/clustertriggerbindings/:name';
    }
  },
  customRuns: {
    all() {
      return '/customruns';
    },
    byName() {
      return byNamespace({ path: '/customruns/:name' });
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
      return byNamespace({ path: '/eventlisteners/:name' });
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
      return byNamespace({ path: '/interceptors/:name' });
    },
    byNamespace() {
      return byNamespace({ path: '/interceptors' });
    }
  },
  kubernetesResources: {
    all() {
      return '/:group/:version/:kind';
    },
    byName() {
      return byNamespace({ path: '/:group/:version/:kind/:name' });
    },
    byNamespace() {
      return byNamespace({ path: '/:group/:version/:kind' });
    },
    cluster() {
      return '/:group/:version/:kind/:name';
    }
  },
  pipelineRuns: {
    all() {
      return '/pipelineruns';
    },
    byName() {
      return byNamespace({
        path: '/pipelineruns/:name'
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
    byName() {
      return byNamespace({ path: '/pipelines/:name' });
    },
    byNamespace() {
      return byNamespace({ path: '/pipelines' });
    }
  },
  settings() {
    return '/settings';
  },
  stepActions: {
    all() {
      return '/stepactions';
    },
    byName() {
      return byNamespace({ path: '/stepactions/:name' });
    },
    byNamespace() {
      return byNamespace({ path: '/stepactions' });
    }
  },
  taskRuns: {
    all() {
      return '/taskruns';
    },
    byName() {
      return byNamespace({ path: '/taskruns/:name' });
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
    byName() {
      return byNamespace({ path: '/tasks/:name' });
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
      return byNamespace({ path: '/triggerbindings/:name' });
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
      return byNamespace({ path: '/triggers/:name' });
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
      return byNamespace({ path: '/triggertemplates/:name' });
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

urls.taskRuns.byTask = ({ namespace, taskName: name }) => {
  const baseURL = urls.taskRuns.byNamespace({ namespace });
  return filteredURL({ baseURL, label: labels.TASK, name });
};

export { urls };
