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
/* istanbul ignore file */
import { getStatus } from './status';

const defaultHeight = 30;
const defaultWidth = 200;

function getBaseNodes() {
  const graph = {
    children: [],
    edges: [],
    id: 'root',
    label: 'root',
    nChildren: 0,
    nParents: 0
  };

  const start = {
    id: 'Start',
    height: 60,
    label: 'Start',
    nChildren: 0,
    nParents: 0,
    type: 'Start',
    width: 60
  };

  const end = {
    id: 'End',
    height: 60,
    label: 'End',
    nChildren: 0,
    nParents: 0,
    type: 'End',
    width: 60
  };

  return { graph, start, end };
}

function getStepStatus(taskRun, stepName) {
  let stepStatus =
    taskRun &&
    taskRun.status &&
    taskRun.status.steps &&
    taskRun.status.steps.find(_ => _.name === stepName);

  if (!stepStatus) {
    return null;
  }

  if (stepStatus.terminated) {
    if (stepStatus.terminated.reason === 'Completed') {
      stepStatus = 'success';
    } else if (stepStatus.terminated.reason === 'Error') {
      stepStatus = 'error';
    }
  } else if (stepStatus.running) {
    stepStatus = 'running';
  }

  return stepStatus;
}

function getTaskRunStatus(taskRun) {
  if (!taskRun) {
    return null;
  }

  let { status } = getStatus(taskRun);
  switch (status) {
    case 'True':
      status = 'success';
      break;
    case 'False':
      status = 'error';
      break;
    default:
      status = 'running';
  }

  return status;
}

function addEdge({ child, graph, parent, singletonSource, singletonTarget }) {
  if (!parent.ports) {
    parent.ports = []; // eslint-disable-line
  }
  if (!child.ports) {
    child.ports = []; // eslint-disable-line
  }

  const sourcePort = `${parent.id}-` + (singletonSource ? 'pSourceSingleton' : `p${parent.ports.length}`); // eslint-disable-line
  if (!parent.ports.find(_ => _.id === sourcePort)) {
    parent.ports.push({ id: sourcePort });
  }

  const targetPort = `${child.id}-` + (singletonTarget ? 'pTargetSingleton' : `p${child.ports.length}`); // eslint-disable-line
  if (!child.ports.find(_ => _.id === targetPort)) {
    child.ports.push({ id: targetPort });
  }

  graph.edges.push({
    id: `${parent.id}-${child.id}`,
    source: parent.id,
    sourcePort,
    target: child.id,
    targetPort
  });

  child.nParents++; // eslint-disable-line
  parent.nChildren++; // eslint-disable-line
}

function addNodes({ expanded, graph, pipeline, pipelineRun, tasks }) {
  // map from Task.metadata.name to Task
  const taskByTaskName = tasks.reduce((accumulator, task) => {
    accumulator[task.metadata.name] = task;
    return accumulator;
  }, {});

  const taskRunByPipelineTaskName = Object.values(
    pipelineRun.status.taskRuns
  ).reduce((accumulator, taskRun) => {
    accumulator[taskRun.pipelineTaskName] = taskRun;
    return accumulator;
  }, {});

  const nodes = pipeline.spec.tasks.reduce((accumulator, taskRef) => {
    const task = taskByTaskName[taskRef.taskRef.name];
    const taskRun = taskRunByPipelineTaskName[taskRef.name];
    const status = getTaskRunStatus(taskRun);

    let node;
    if (
      task &&
      expanded[taskRef.name] &&
      task.spec.steps &&
      task.spec.steps.length > 0
    ) {
      const subgraph = {
        id: taskRef.name,
        label: taskRef.name,
        children: task.spec.steps.map(step => {
          const stepNode = {
            id: `__step__${taskRef.name}__${step.name}`,
            label: step.name,
            width: defaultWidth,
            height: defaultHeight,
            nChildren: 0,
            nParents: 0,
            status: getStepStatus(taskRun, step.name),
            type: 'Step'
          };

          accumulator[stepNode.id] = stepNode;
          return stepNode;
        }),
        edges: [],
        nParents: 0,
        nChildren: 0,
        status,
        type: 'Task'
      };

      subgraph.children.slice(1).reduce((cur, next) => {
        addEdge({ graph: subgraph, parent: cur, child: next });
        return next;
      }, subgraph.children[0]);

      node = subgraph;
    } else {
      node = {
        id: taskRef.name,
        label: taskRef.name,
        width: defaultWidth,
        height: defaultHeight,
        nChildren: 0,
        nParents: 0,
        status,
        type: 'Task'
      };
    }

    accumulator[taskRef.name] = node;
    graph.children.push(node);

    return accumulator;
  }, {});

  return nodes;
}

function wire({ graph, nodes, parentName, childName }) {
  const parent = nodes[parentName];
  const child = nodes[childName];

  if (parent) {
    addEdge({ graph, parent, child });
  } else {
    console.error('parent not found', childName); // eslint-disable-line no-console
  }
}

/*
 * Create an ELK-compatible graph model from a set of
 * Tekton resources representing a PipelineRun.
 */
export default function buildGraphData({
  expanded = {},
  pipeline,
  pipelineRun,
  tasks
}) {
  const { graph, start, end } = getBaseNodes();
  const nodes = addNodes({ expanded, graph, pipeline, pipelineRun, tasks });

  pipeline.spec.tasks.forEach(task => {
    if (task.runAfter) {
      task.runAfter.forEach(parentName => {
        wire({ graph, nodes, parentName, childName: task.name });
      });
    }

    if (task.resources) {
      const wirePorts = ports => {
        if (ports) {
          ports.forEach(port => {
            if (port.from) {
              port.from.forEach(parentName => {
                wire({ graph, nodes, parentName, childName: task.name });
              });
            }
          });
        }
      };

      wirePorts(task.resources.inputs);
      wirePorts(task.resources.outputs);
    }
  });

  // Wire up the start and end nodes after everything else
  graph.children
    .filter(child => child.nParents === 0)
    .forEach(child =>
      addEdge({ graph, parent: start, child, singletonSource: true })
    );

  graph.children
    .filter(parent => parent.nChildren === 0)
    .forEach(parent =>
      addEdge({ graph, parent, child: end, singletonTarget: true })
    );

  graph.children.push(start);
  graph.children.push(end);

  return graph;
}
