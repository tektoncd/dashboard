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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  InlineNotification,
  StructuredListSkeleton
} from 'carbon-components-react';

import {
  getClusterTasks,
  getPipelineRun,
  getPipelineRunsErrorMessage,
  getTaskRun,
  getTaskRunsErrorMessage,
  getTasks,
  getTasksErrorMessage
} from '../../reducers';

import { fetchPipelineRun } from '../../actions/pipelineRuns';
import { fetchClusterTasks, fetchTasks } from '../../actions/tasks';
import { fetchTaskRuns } from '../../actions/taskRuns';

import RunHeader from '../../components/RunHeader';
import StepDetails from '../../components/StepDetails';
import TaskTree from '../../components/TaskTree';
import {
  getStatus,
  selectedTask,
  selectedTaskRun,
  stepsStatus,
  taskRunStep
} from '../../utils';

import { getStore } from '../../store/index';

import '../../components/Run/Run.scss';

export /* istanbul ignore next */ class PipelineRunContainer extends Component {
  state = {
    selectedStepId: null,
    selectedTaskId: null,
    loading: true
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { namespace, pipelineRunName } = match.params;
    const { match: prevMatch } = prevProps;
    const {
      namespace: prevNamespace,
      pipelineRunName: prevPipelineRunName
    } = prevMatch.params;

    if (
      namespace !== prevNamespace ||
      pipelineRunName !== prevPipelineRunName
    ) {
      this.fetchData();
    }
  }

  handleTaskSelected = (selectedTaskId, selectedStepId) => {
    this.setState({ selectedStepId, selectedTaskId });
  };

  loadPipelineRunData = () => {
    const { pipelineRun } = this.props;
    const {
      status: { taskRuns: taskRunsStatus }
    } = pipelineRun;
    const { message, status, reason } = getStatus(pipelineRun);
    return {
      error: status === 'False' && !taskRunsStatus && { message, reason },
      pipelineRun,
      taskRunNames: taskRunsStatus && Object.keys(taskRunsStatus)
    };
  };

  loadTaskRuns = (pipelineRun, taskRunNames) => {
    let runs = taskRunNames.map(taskRunName =>
      getTaskRun(getStore().getState(), {
        name: taskRunName,
        namespace: pipelineRun.metadata.namespace
      })
    );

    const {
      status: { taskRuns: taskRunDetails }
    } = pipelineRun;

    runs = runs.map(taskRun => {
      const taskName = taskRun.spec.taskRef.name;
      const taskKind = taskRun.spec.taskRef.kind;
      const task = selectedTask(
        taskName,
        taskKind === 'ClusterTask' ? this.props.clusterTasks : this.props.tasks
      );
      const taskRunName = taskRun.metadata.name;
      const taskRunNamespace = taskRun.metadata.namespace;
      const { reason, status: succeeded } = getStatus(taskRun);
      const { pipelineTaskName } = taskRunDetails[taskRunName];
      const steps = stepsStatus(task.spec.steps, taskRun.status.steps);
      return {
        id: taskRun.metadata.uid,
        pipelineTaskName,
        pod: taskRun.status.podName,
        reason,
        steps,
        succeeded,
        taskName,
        taskRunName,
        namespace: taskRunNamespace
      };
    });

    return runs;
  };

  fetchData() {
    const { match } = this.props;
    const { namespace, pipelineRunName } = match.params;
    this.setState({ loading: true }, async () => {
      await Promise.all([
        this.props.fetchPipelineRun({ name: pipelineRunName, namespace }),
        this.props.fetchTasks(),
        this.props.fetchClusterTasks(),
        this.props.fetchTaskRuns()
      ]);
      this.setState({ loading: false });
    });
  }

  render() {
    const { match, error } = this.props;
    const { pipelineRunName } = match.params;

    const { selectedStepId, selectedTaskId, loading } = this.state;

    if (loading) {
      return <StructuredListSkeleton border />;
    }

    if (error) {
      return (
        <InlineNotification
          kind="error"
          hideCloseButton
          lowContrast
          title="Error loading PipelineRun"
          subtitle={JSON.stringify(error, Object.getOwnPropertyNames(error))}
        />
      );
    }

    if (!this.props.pipelineRun) {
      return (
        <InlineNotification
          kind="info"
          hideCloseButton
          lowContrast
          title="Cannot load PipelineRun"
          subtitle={`PipelineRun ${pipelineRunName} not found`}
        />
      );
    }

    const {
      error: pipelineRunError,
      pipelineRun,
      taskRunNames
    } = this.loadPipelineRunData();

    const {
      lastTransitionTime,
      reason: pipelineRunReason,
      status: pipelineRunStatus
    } = getStatus(pipelineRun);

    if (pipelineRunError) {
      return (
        <>
          <RunHeader
            lastTransitionTime={lastTransitionTime}
            loading={loading}
            runName={pipelineRunName}
            reason="Error"
            status={pipelineRunStatus}
          />
          <InlineNotification
            kind="error"
            hideCloseButton
            lowContrast
            title={`Unable to load PipelineRun details: ${
              pipelineRunError.reason
            }`}
            subtitle={pipelineRunError.message}
          />
        </>
      );
    }
    const taskRuns = this.loadTaskRuns(pipelineRun, taskRunNames);
    const taskRun = selectedTaskRun(selectedTaskId, taskRuns) || {};

    const { definition, reason, status, stepName, stepStatus } = taskRunStep(
      selectedStepId,
      taskRun
    );

    return (
      <>
        <RunHeader
          lastTransitionTime={lastTransitionTime}
          loading={loading}
          runName={pipelineRunName}
          reason={pipelineRunReason}
          status={pipelineRunStatus}
        />
        <div className="tasks">
          <TaskTree
            onSelect={this.handleTaskSelected}
            selectedTaskId={selectedTaskId}
            taskRuns={taskRuns}
          />
          {selectedStepId && (
            <StepDetails
              definition={definition}
              reason={reason}
              status={status}
              stepName={stepName}
              stepStatus={stepStatus}
              taskRun={taskRun}
            />
          )}
        </div>
      </>
    );
  }
}

PipelineRunContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      pipelineName: PropTypes.string.isRequired,
      pipelineRunName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

/* istanbul ignore next */
function mapStateToProps(state, ownProps) {
  const { match } = ownProps;
  const { namespace } = match.params;

  return {
    error:
      getPipelineRunsErrorMessage(state) ||
      getTasksErrorMessage(state) ||
      getTaskRunsErrorMessage(state),
    namespace,
    pipelineRun: getPipelineRun(state, {
      name: ownProps.match.params.pipelineRunName,
      namespace
    }),
    tasks: getTasks(state, { namespace }),
    clusterTasks: getClusterTasks(state)
  };
}

const mapDispatchToProps = {
  fetchClusterTasks,
  fetchPipelineRun,
  fetchTasks,
  fetchTaskRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelineRunContainer);
