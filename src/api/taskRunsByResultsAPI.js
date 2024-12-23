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

import { useQuery } from '@tanstack/react-query';
import { getRecordAPI, getRecordsAPI } from './utils';
import { checkStatus } from './comms';

// useTaskRunsByResultsAPI list all TaskRuns by ResultsAPI
// Return a list of Records
export function useTaskRunsByResultsAPI(namespace, queryConfig) {
  const query = useQuery({
    queryKey: ['results', 'taskruns', namespace],
    queryFn: async () => {
      const uri = getRecordsAPI({
        group: 'results.tekton.dev',
        version: 'v1alpha2',
        namespace,
        result: '-',
        filters: 'data_type==TASK_RUN'
      });
      console.debug("Querying TaskRuns by ResultsAPI, uri:", uri);
      const resp = await fetch(uri, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => checkStatus(response, false));

      if (resp.records) {
        resp.records = resp.records.map(record => {
          return {
            ...record,
            data: {
              type: record.data.type,
              value: JSON.parse(atob(record.data.value))
            }
          };
        });
      }
      return resp;
    },
    staleTime: 0,
    ...queryConfig
  });
  if (query.data) {
    console.debug(
      'records queried for TaskRuns, response: ',
      JSON.parse(JSON.stringify(query.data))
    );
  }
  return {
    ...query,
    data: query.data?.records || []
  };
}

// useTaskRunByResultsAPI get a single TaskRun by ResultsAPI
// Return a single Record
export function useTaskRunByResultsAPI(
  namespace,
  resultUID,
  recordUID,
  queryConfig
) {
  const query = useQuery({
    queryKey: ['results', 'taskrun', resultUID, recordUID, recordUID],
    queryFn: async () => {
      const uri = getRecordAPI({
        group: 'results.tekton.dev',
        version: 'v1alpha2',
        namespace,
        resultUID,
        recordUID
      });
      console.debug('Querying TaskRun by ResultsAPI, uri:', uri);
      const resp = await fetch(uri, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => checkStatus(response, false));
      if (resp.data) {
        if (!resp.data.type.includes('TaskRun')) {
          throw new Error(
            `Found a record of type other than taskrun: ${resp.data.type}`
          );
        }
        resp.data = {
          type: resp.data.type,
          value: JSON.parse(atob(resp.data.value))
        };
      }
      return resp;
    },
    ...queryConfig
  });
  if (query.data) {
    console.debug(
      'TaskRun queried by ResultsAPI, record:',
      JSON.parse(JSON.stringify(query.data))
    );
  }
  return query;
}
