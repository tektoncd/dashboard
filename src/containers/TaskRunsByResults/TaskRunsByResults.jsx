/*
Copyright 2024 The Tekton Authors
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
import { urls } from '@tektoncd/dashboard-utils';
import { useParams } from 'react-router-dom';
import { TaskRuns as TaskRunsList } from '@tektoncd/dashboard-components';
import NotFound from '../NotFound';
import { useSelectedNamespace } from '../../api';
import { useTaskRunsByResultsAPI } from '../../api/taskRunsByResultsAPI';
import ListPageLayout from '../ListPageLayout';

const recordAnnotationKey = 'results.tekton.dev/record';
function TaskRunsByResults() {
  function getTaskRunURL({ namespace, taskRun }) {
    // TODO(xinnjie): best user experience will be like if taskRun is still exist in kubernetes, provide a link to the taskRun page with live info and logs.
    // if not, provide a link to the taskRun page by ResultsAPI
    const recordAnnotation = taskRun.metadata.annotations[recordAnnotationKey];
    // record annotation format: default/results/8b19a00c-d702-4903-a9eb-d41d37250240/records/8b19a00c-d702-4903-a9eb-d41d37250240
    const [, , resultuid, , recorduid] = recordAnnotation.split('/');
    return urls.taskRunsByResults.byUID({
      namespace,
      resultuid,
      recorduid
    });
  }
  const params = useParams();
  const { namespace: namespaceParam } = params;
  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;

  const {
    data: recordsForTaskRuns = [],
    error,
    isLoading
  } = useTaskRunsByResultsAPI(namespace, {
    staleTime: 1000 // 1 second
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return (
      <NotFound
        suggestions={[
          {
            text: 'TaskRuns',
            to: urls.results.taskRunsByNamespace({ namespace })
          }
        ]}
      />
    );
  }
  const taskRuns = recordsForTaskRuns.map(record => record.data.value);

  return (
    <ListPageLayout
      error={error}
      resources={taskRuns}
      title="TaskRuns by Results"
    >
      {({ resources }) => (
        <TaskRunsList
          filters={[]}
          loading={isLoading}
          selectedNamespace={namespace}
          taskRuns={resources}
          getTaskRunURL={getTaskRunURL}
        />
      )}
    </ListPageLayout>
  );
}

export default TaskRunsByResults;
