/*
Copyright 2019-2020 The Tekton Authors
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
import { paths, urls } from './router';

const eventListenerName = 'fake_eventListenerName';
const namespace = 'fake_namespace';
const pipelineName = 'fake_pipelineName';
const pipelineResourceName = 'fake_pipelineResourceName';
const pipelineRunName = 'fake_pipelineRunName';
const serviceAccountName = 'fake_serviceAccountName';
const taskName = 'fake_taskName';
const taskRunName = 'fake_taskRunName';
const triggerBindingName = 'fake_triggerBindingName';
const clusterTriggerBindingName = 'fake_clusterTriggerBindingName';
const triggerTemplateName = 'fake_triggerTemplateName';

describe('clusterTasks', () => {
  it('all', () => {
    expect(urls.clusterTasks.all()).toEqual(
      generatePath(paths.clusterTasks.all())
    );
  });
});

describe('extensions', () => {
  it('all', () => {
    expect(urls.extensions.all()).toEqual(generatePath(paths.extensions.all()));
  });

  it('byName', () => {
    const name = 'name';
    expect(urls.extensions.byName({ name })).toEqual(
      generatePath(paths.extensions.byName({ name }), { name })
    );
  });
});

it('about', () => {
  expect(urls.about()).toEqual(generatePath(paths.about()));
});

it('importResources', () => {
  expect(urls.importResources()).toEqual(generatePath(paths.importResources()));
});

describe('byNamespace', () => {
  it('default', () => {
    expect(urls.byNamespace({ namespace })).toEqual(
      generatePath(paths.byNamespace(), { namespace })
    );
  });

  it('with path', () => {
    const path = '/path';
    expect(urls.byNamespace({ namespace, path })).toEqual(
      generatePath(paths.byNamespace({ path }), { namespace, path })
    );
  });
});

describe('pipelineResources', () => {
  it('all', () => {
    expect(urls.pipelineResources.all()).toEqual(
      generatePath(paths.pipelineResources.all())
    );
  });

  it('byNamespace', () => {
    expect(urls.pipelineResources.byNamespace({ namespace })).toEqual(
      generatePath(paths.pipelineResources.byNamespace(), { namespace })
    );
  });

  it('byName', () => {
    expect(
      urls.pipelineResources.byName({ namespace, pipelineResourceName })
    ).toEqual(
      generatePath(paths.pipelineResources.byName(), {
        namespace,
        pipelineResourceName
      })
    );
  });
});

describe('pipelineRuns', () => {
  it('all', () => {
    expect(urls.pipelineRuns.all()).toEqual(
      generatePath(paths.pipelineRuns.all())
    );
  });

  it('byNamespace', () => {
    expect(urls.pipelineRuns.byNamespace({ namespace })).toEqual(
      generatePath(paths.pipelineRuns.byNamespace(), { namespace })
    );
  });

  it('byPipeline', () => {
    expect(urls.pipelineRuns.byPipeline({ namespace, pipelineName })).toEqual(
      generatePath(paths.pipelineRuns.byPipeline(), { namespace, pipelineName })
    );
  });

  it('byName', () => {
    expect(urls.pipelineRuns.byName({ namespace, pipelineRunName })).toEqual(
      generatePath(paths.pipelineRuns.byName(), {
        namespace,
        pipelineRunName
      })
    );
  });
});

describe('pipelines', () => {
  it('all', () => {
    expect(urls.pipelines.all()).toEqual(generatePath(paths.pipelines.all()));
  });

  it('byNamespace', () => {
    expect(urls.pipelines.byNamespace({ namespace })).toEqual(
      generatePath(paths.pipelines.byNamespace(), { namespace })
    );
  });
});

describe('rawCRD', () => {
  it('cluster', () => {
    const type = 'tasks';
    const name = taskName;
    expect(urls.rawCRD.cluster({ type, name })).toEqual(
      generatePath(paths.rawCRD.cluster(), { type, name })
    );
  });

  it('byNamespace', () => {
    const type = 'tasks';
    const name = taskName;
    expect(urls.rawCRD.byNamespace({ namespace, type, name })).toEqual(
      generatePath(paths.rawCRD.byNamespace(), { namespace, type, name })
    );
  });
});

describe('secrets', () => {
  it('all', () => {
    expect(urls.secrets.all()).toEqual(generatePath(paths.secrets.all()));
  });
});
describe('serviceAccounts', () => {
  it('all', () => {
    expect(urls.serviceAccounts.all()).toEqual(
      generatePath(paths.serviceAccounts.all())
    );
  });
  it('byNamespace', () => {
    expect(urls.serviceAccounts.byNamespace({ namespace })).toEqual(
      generatePath(paths.serviceAccounts.byNamespace(), { namespace })
    );
  });
  it('byName', () => {
    expect(
      urls.serviceAccounts.byName({ namespace, serviceAccountName })
    ).toEqual(
      generatePath(paths.serviceAccounts.byName(), {
        namespace,
        serviceAccountName
      })
    );
  });
});
describe('taskRuns', () => {
  it('all', () => {
    expect(urls.taskRuns.all()).toEqual(generatePath(paths.taskRuns.all()));
  });

  it('byNamespace', () => {
    expect(urls.taskRuns.byNamespace({ namespace })).toEqual(
      generatePath(paths.taskRuns.byNamespace(), { namespace })
    );
  });

  it('byTask', () => {
    expect(urls.taskRuns.byTask({ namespace, taskName })).toEqual(
      generatePath(paths.taskRuns.byTask(), { namespace, taskName })
    );
  });

  it('byClusterTask', () => {
    expect(urls.taskRuns.byClusterTask({ namespace, taskName })).toEqual(
      generatePath(paths.taskRuns.byClusterTask(), {
        namespace,
        taskName
      })
    );
  });

  it('byName', () => {
    expect(urls.taskRuns.byName({ namespace, taskRunName })).toEqual(
      generatePath(paths.taskRuns.byName(), { namespace, taskRunName })
    );
  });
});

describe('tasks', () => {
  it('all', () => {
    expect(urls.tasks.all()).toEqual(generatePath(paths.tasks.all()));
  });

  it('byNamespace', () => {
    expect(urls.tasks.byNamespace({ namespace })).toEqual(
      generatePath(paths.tasks.byNamespace(), { namespace })
    );
  });
});

describe('eventListeners', () => {
  it('all', () => {
    expect(urls.eventListeners.all()).toEqual(
      generatePath(paths.eventListeners.all())
    );
  });
  it('byNamespace', () => {
    expect(urls.eventListeners.byNamespace({ namespace })).toEqual(
      generatePath(paths.eventListeners.byNamespace(), { namespace })
    );
  });
  it('byName', () => {
    expect(
      urls.eventListeners.byName({ namespace, eventListenerName })
    ).toEqual(
      generatePath(paths.eventListeners.byName(), {
        namespace,
        eventListenerName
      })
    );
  });
});

describe('triggerTemplates', () => {
  it('all', () => {
    expect(urls.triggerTemplates.all()).toEqual(
      generatePath(paths.triggerTemplates.all())
    );
  });
  it('byNamespace', () => {
    expect(urls.triggerTemplates.byNamespace({ namespace })).toEqual(
      generatePath(paths.triggerTemplates.byNamespace(), { namespace })
    );
  });
  it('byName', () => {
    expect(
      urls.triggerTemplates.byName({ namespace, triggerTemplateName })
    ).toEqual(
      generatePath(paths.triggerTemplates.byName(), {
        namespace,
        triggerTemplateName
      })
    );
  });
});

describe('triggerBindings', () => {
  it('all', () => {
    expect(urls.triggerBindings.all()).toEqual(
      generatePath(paths.triggerBindings.all())
    );
  });
  it('byNamespace', () => {
    expect(urls.triggerBindings.byNamespace({ namespace })).toEqual(
      generatePath(paths.triggerBindings.byNamespace(), { namespace })
    );
  });
  it('byName', () => {
    expect(
      urls.triggerBindings.byName({ namespace, triggerBindingName })
    ).toEqual(
      generatePath(paths.triggerBindings.byName(), {
        namespace,
        triggerBindingName
      })
    );
  });
});

describe('clusterTriggerBindings', () => {
  it('all', () => {
    expect(urls.clusterTriggerBindings.all()).toEqual(
      generatePath(paths.clusterTriggerBindings.all())
    );
  });
  it('byName', () => {
    expect(
      urls.clusterTriggerBindings.byName({ clusterTriggerBindingName })
    ).toEqual(
      generatePath(paths.clusterTriggerBindings.byName(), {
        clusterTriggerBindingName
      })
    );
  });
});

describe('kubernetesResources', () => {
  const group = 'fake_group';
  const name = 'fake_name';
  const type = 'fake_type';
  const version = 'fake_version';

  it('all', () => {
    expect(urls.kubernetesResources.all({ group, type, version })).toEqual(
      generatePath(paths.kubernetesResources.all(), { group, type, version })
    );
  });
  it('byNamespace', () => {
    expect(
      urls.kubernetesResources.byNamespace({ group, namespace, type, version })
    ).toEqual(
      generatePath(paths.kubernetesResources.byNamespace(), {
        group,
        namespace,
        type,
        version
      })
    );
  });
  it('cluster', () => {
    expect(
      urls.kubernetesResources.cluster({ group, name, type, version })
    ).toEqual(
      generatePath(paths.kubernetesResources.cluster(), {
        group,
        name,
        type,
        version
      })
    );
  });
  it('byName', () => {
    expect(
      urls.kubernetesResources.byName({ group, name, namespace, type, version })
    ).toEqual(
      generatePath(paths.kubernetesResources.byName(), {
        group,
        name,
        namespace,
        type,
        version
      })
    );
  });
});
