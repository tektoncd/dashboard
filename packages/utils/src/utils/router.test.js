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
import { generatePath } from 'react-router-dom';
import { paths, urls } from './router';
import { labels } from './constants';

const clusterInterceptorName = 'fake_clusterInterceptorName';
const clusterTriggerBindingName = 'fake_clusterTriggerBindingName';
const eventListenerName = 'fake_eventListenerName';
const namespace = 'fake_namespace';
const pipelineName = 'fake_pipelineName';
const pipelineRunName = 'fake_pipelineRunName';
const runName = 'fake_runName';
const stepActionName = 'fake_stepActionName';
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

describe('clusterInterceptors', () => {
  it('all', () => {
    expect(urls.clusterInterceptors.all()).toEqual(
      generatePath(paths.clusterInterceptors.all())
    );
  });
  it('byName', () => {
    expect(
      urls.clusterInterceptors.byName({ name: clusterInterceptorName })
    ).toEqual(
      generatePath(paths.clusterInterceptors.byName(), {
        name: clusterInterceptorName
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
      urls.clusterTriggerBindings.byName({ name: clusterTriggerBindingName })
    ).toEqual(
      generatePath(paths.clusterTriggerBindings.byName(), {
        name: clusterTriggerBindingName
      })
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
      urls.eventListeners.byName({ name: eventListenerName, namespace })
    ).toEqual(
      generatePath(paths.eventListeners.byName(), {
        name: eventListenerName,
        namespace
      })
    );
  });

  it('byNamespace', () => {
    expect(urls.eventListeners.byNamespace({ namespace })).toEqual(
      generatePath(paths.eventListeners.byNamespace(), { namespace })
    );
  });
});

it('importResources', () => {
  expect(urls.importResources()).toEqual(generatePath(paths.importResources()));
});

describe('kubernetesResources', () => {
  const group = 'fake_group';
  const name = 'fake_name';
  const kind = 'fake_kind';
  const version = 'fake_version';

  it('all', () => {
    expect(urls.kubernetesResources.all({ group, kind, version })).toEqual(
      generatePath(paths.kubernetesResources.all(), { group, kind, version })
    );
  });

  it('byName', () => {
    expect(
      urls.kubernetesResources.byName({ group, kind, name, namespace, version })
    ).toEqual(
      generatePath(paths.kubernetesResources.byName(), {
        group,
        kind,
        name,
        namespace,
        version
      })
    );
  });

  it('byNamespace', () => {
    expect(
      urls.kubernetesResources.byNamespace({ group, kind, namespace, version })
    ).toEqual(
      generatePath(paths.kubernetesResources.byNamespace(), {
        group,
        kind,
        namespace,
        version
      })
    );
  });

  it('cluster', () => {
    expect(
      urls.kubernetesResources.cluster({ group, kind, name, version })
    ).toEqual(
      generatePath(paths.kubernetesResources.cluster(), {
        group,
        kind,
        name,
        version
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

  it('byName', () => {
    expect(
      urls.pipelineRuns.byName({ name: pipelineRunName, namespace })
    ).toEqual(
      generatePath(paths.pipelineRuns.byName(), {
        name: pipelineRunName,
        namespace
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
    const base = 'http://localhost';
    const url = new URL(
      urls.pipelineRuns.byPipeline({ namespace, pipelineName }),
      base
    );
    expect(url.pathname).toEqual(
      generatePath(paths.pipelineRuns.byNamespace(), { namespace })
    );
    expect(url.searchParams.get('labelSelector')).toEqual(
      `${labels.PIPELINE}=${pipelineName}`
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

describe('customRuns', () => {
  it('all', () => {
    expect(urls.customRuns.all()).toEqual(generatePath(paths.customRuns.all()));
  });

  it('byName', () => {
    expect(urls.customRuns.byName({ name: runName, namespace })).toEqual(
      generatePath(paths.customRuns.byName(), {
        name: runName,
        namespace
      })
    );
  });

  it('byNamespace', () => {
    expect(urls.customRuns.byNamespace({ namespace })).toEqual(
      generatePath(paths.customRuns.byNamespace(), { namespace })
    );
  });
});

it('settings', () => {
  expect(urls.settings()).toEqual(generatePath(paths.settings()));
});

describe('stepActions', () => {
  it('all', () => {
    expect(urls.stepActions.all()).toEqual(
      generatePath(paths.stepActions.all())
    );
  });

  it('byName', () => {
    expect(
      urls.stepActions.byName({ name: stepActionName, namespace })
    ).toEqual(
      generatePath(paths.stepActions.byName(), {
        name: stepActionName,
        namespace
      })
    );
  });

  it('byNamespace', () => {
    expect(urls.stepActions.byNamespace({ namespace })).toEqual(
      generatePath(paths.stepActions.byNamespace(), { namespace })
    );
  });
});

describe('taskRuns', () => {
  it('all', () => {
    expect(urls.taskRuns.all()).toEqual(generatePath(paths.taskRuns.all()));
  });

  it('byName', () => {
    expect(urls.taskRuns.byName({ name: taskRunName, namespace })).toEqual(
      generatePath(paths.taskRuns.byName(), { name: taskRunName, namespace })
    );
  });

  it('byNamespace', () => {
    expect(urls.taskRuns.byNamespace({ namespace })).toEqual(
      generatePath(paths.taskRuns.byNamespace(), { namespace })
    );
  });

  it('byTask', () => {
    const base = 'http://localhost';
    const url = new URL(urls.taskRuns.byTask({ namespace, taskName }), base);
    expect(url.pathname).toEqual(
      generatePath(paths.taskRuns.byNamespace(), { namespace })
    );
    expect(url.searchParams.get('labelSelector')).toEqual(
      `${labels.TASK}=${taskName}`
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
      urls.triggerBindings.byName({ name: triggerBindingName, namespace })
    ).toEqual(
      generatePath(paths.triggerBindings.byName(), {
        name: triggerBindingName,
        namespace
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
    expect(urls.triggers.byName({ name: triggerName, namespace })).toEqual(
      generatePath(paths.triggers.byName(), {
        name: triggerName,
        namespace
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
      urls.triggerTemplates.byName({ name: triggerTemplateName, namespace })
    ).toEqual(
      generatePath(paths.triggerTemplates.byName(), {
        name: triggerTemplateName,
        namespace
      })
    );
  });

  it('byNamespace', () => {
    expect(urls.triggerTemplates.byNamespace({ namespace })).toEqual(
      generatePath(paths.triggerTemplates.byNamespace(), { namespace })
    );
  });
});
