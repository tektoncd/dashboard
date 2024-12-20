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
import NotFound from '../NotFound';
import { useSelectedNamespace } from '../../api';
import { useTaskRunsByResultsAPI } from '../../api/taskRunsByResultsAPI';


function TaskRunsByResults() {
  const params = useParams();
  const { namespace: namespaceParam } = params;

  const { selectedNamespace } = useSelectedNamespace();
  const namespace = namespaceParam || selectedNamespace;

  const {
    data: recordsForTaskRuns = [],
    error,
    isLoading
  } = useTaskRunsByResultsAPI({
    namespace
  });
  console.log(recordsForTaskRuns);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.log(error);
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

  return <div>TaskRuns By Results</div>;
}

export default TaskRunsByResults;
