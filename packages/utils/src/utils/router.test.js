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
import { paths, urls } from './router';

const namespace = 'fake_namespace';
const pipelineName = 'fake_pipelineName';
const pipelineResourceName = 'fake_pipelineResourceName';
const pipelineRunName = 'fake_pipelineRunName';
const taskName = 'fake_taskName';
const taskRunName = 'fake_taskRunName';

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
    const taskType = 'tasks';
    expect(urls.taskRuns.byTask({ namespace, taskType, taskName })).toEqual(
      generatePath(paths.taskRuns.byTask(), { namespace, taskType, taskName })
    );
  });

  it('byClusterTask', () => {
    const taskType = 'clustertasks';
    expect(
      urls.taskRuns.byClusterTask({ namespace, taskType, taskName })
    ).toEqual(
      generatePath(paths.taskRuns.byClusterTask(), {
        namespace,
        taskType,
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
