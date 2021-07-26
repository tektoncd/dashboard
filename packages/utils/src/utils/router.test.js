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
import { paths, urls } from './router';

const clusterInterceptorName = 'fake_clusterInterceptorName';
const clusterTriggerBindingName = 'fake_clusterTriggerBindingName';
const conditionName = 'fake_conditionName';
const eventListenerName = 'fake_eventListenerName';
const namespace = 'fake_namespace';
const pipelineName = 'fake_pipelineName';
const pipelineResourceName = 'fake_pipelineResourceName';
const pipelineRunName = 'fake_pipelineRunName';
const taskName = 'fake_taskName';
const taskRunName = 'fake_taskRunName';
const triggerName = 'fake_triggerName';
const triggerBindingName = 'fake_triggerBindingName';
const triggerTemplateName = 'fake_triggerTemplateName';

it('about', () => {
  expect(urls.about()).toEqual(generatePath(paths.about()));
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

describe('clusterTasks', () => {
  it('all', () => {
    expect(urls.clusterTasks.all()).toEqual(
      generatePath(paths.clusterTasks.all())
    );
  });
});

describe('clusterInterceptors', () => {
  it('all', () => {
    expect(urls.clusterInterceptors.all()).toEqual(
      generatePath(paths.clusterInterceptors.all())
    );
  });
  it('byName', () => {
    expect(urls.clusterInterceptors.byName({ clusterInterceptorName })).toEqual(
      generatePath(paths.clusterInterceptors.byName(), {
        clusterInterceptorName
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

describe('conditions', () => {
  it('all', () => {
    expect(urls.conditions.all()).toEqual(generatePath(paths.conditions.all()));
  });

  it('byName', () => {
    expect(urls.conditions.byName({ namespace, conditionName })).toEqual(
      generatePath(paths.conditions.byName(), {
        namespace,
        conditionName
      })
    );
  });

  it('byNamespace', () => {
    expect(urls.conditions.byNamespace({ namespace })).toEqual(
      generatePath(paths.conditions.byNamespace(), { namespace })
    );
  });
});

describe('eventListeners', () => {
  it('all', () => {
    expect(urls.eventListeners.all()).toEqual(
      generatePath(paths.eventListeners.all())
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

  it('byNamespace', () => {
    expect(urls.eventListeners.byNamespace({ namespace })).toEqual(
      generatePath(paths.eventListeners.byNamespace(), { namespace })
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

it('importResources', () => {
  expect(urls.importResources()).toEqual(generatePath(paths.importResources()));
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
});

describe('pipelineResources', () => {
  it('all', () => {
    expect(urls.pipelineResources.all()).toEqual(
      generatePath(paths.pipelineResources.all())
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

  it('byNamespace', () => {
    expect(urls.pipelineResources.byNamespace({ namespace })).toEqual(
      generatePath(paths.pipelineResources.byNamespace(), { namespace })
    );
  });

  it('create', () => {
    expect(urls.pipelineResources.create()).toEqual(
      generatePath(paths.pipelineResources.create())
    );
  });
});

describe('pipelineRuns', () => {
  it('all', () => {
    expect(urls.pipelineRuns.all()).toEqual(
      generatePath(paths.pipelineRuns.all())
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

  it('byNamespace', () => {
    expect(urls.pipelineRuns.byNamespace({ namespace })).toEqual(
      generatePath(paths.pipelineRuns.byNamespace(), { namespace })
    );
  });

  it('create', () => {
    expect(urls.pipelineRuns.create()).toEqual(
      generatePath(paths.pipelineRuns.create())
    );
  });

  it('byPipeline', () => {
    expect(urls.pipelineRuns.byPipeline({ namespace, pipelineName })).toEqual(
      generatePath(paths.pipelineRuns.byPipeline(), { namespace, pipelineName })
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
  it('byNamespace', () => {
    const type = 'tasks';
    const name = taskName;
    expect(urls.rawCRD.byNamespace({ namespace, type, name })).toEqual(
      generatePath(paths.rawCRD.byNamespace(), { namespace, type, name })
    );
  });

  it('cluster', () => {
    const type = 'tasks';
    const name = taskName;
    expect(urls.rawCRD.cluster({ type, name })).toEqual(
      generatePath(paths.rawCRD.cluster(), { type, name })
    );
  });
});

it('settings', () => {
  expect(urls.settings()).toEqual(generatePath(paths.settings()));
});

describe('taskRuns', () => {
  it('all', () => {
    expect(urls.taskRuns.all()).toEqual(generatePath(paths.taskRuns.all()));
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

  it('create', () => {
    expect(urls.taskRuns.create()).toEqual(
      generatePath(paths.taskRuns.create())
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

describe('triggerBindings', () => {
  it('all', () => {
    expect(urls.triggerBindings.all()).toEqual(
      generatePath(paths.triggerBindings.all())
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

  it('byNamespace', () => {
    expect(urls.triggerBindings.byNamespace({ namespace })).toEqual(
      generatePath(paths.triggerBindings.byNamespace(), { namespace })
    );
  });
});

describe('triggers', () => {
  it('all', () => {
    expect(urls.triggers.all()).toEqual(generatePath(paths.triggers.all()));
  });

  it('byName', () => {
    expect(urls.triggers.byName({ namespace, triggerName })).toEqual(
      generatePath(paths.triggers.byName(), {
        namespace,
        triggerName
      })
    );
  });

  it('byNamespace', () => {
    expect(urls.triggers.byNamespace({ namespace })).toEqual(
      generatePath(paths.triggers.byNamespace(), { namespace })
    );
  });
});

describe('triggerTemplates', () => {
  it('all', () => {
    expect(urls.triggerTemplates.all()).toEqual(
      generatePath(paths.triggerTemplates.all())
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

  it('byNamespace', () => {
    expect(urls.triggerTemplates.byNamespace({ namespace })).toEqual(
      generatePath(paths.triggerTemplates.byNamespace(), { namespace })
    );
  });
});
