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
import { getRecordsAPI } from './utils';

// useTaskRunsByResultsAPI list all TaskRuns by ResultsAPI
export function useTaskRunsByResultsAPI(namespace, queryConfig) {
  const query = useQuery({
    queryKey: ['resultsAPI', 'taskruns', namespace],
    queryFn: async () => {
      const uri = getRecordsAPI({
        group: 'results.tekton.dev',
        version: 'v1alpha2',
        namespace,
        result: '-',
        filters: 'data_type==TASK_RUN'
      });
      return fetch(uri, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer ' +
            'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU5OFJkVEQ3ZVV2T3puNjFheklxM3RUc2xSWGdDNFdHTjlfQWN4b1RGc3cifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiLCJrM3MiXSwiZXhwIjoxNzM0Njg2MTcwLCJpYXQiOjE3MzQ2ODI1NzAsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwianRpIjoiNGViNTMzMDktMmQ2Yy00NzZiLWFlZDktZjJkMTE1MzAyMmYyIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJ0ZWt0b24tcGlwZWxpbmVzIiwic2VydmljZWFjY291bnQiOnsibmFtZSI6InRla3Rvbi1yZXN1bHRzLWRlYnVnIiwidWlkIjoiZTc5MGQwZTctZDJhYy00Njg3LWJiZjgtYjlkYmJhZTY5OTFkIn19LCJuYmYiOjE3MzQ2ODI1NzAsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDp0ZWt0b24tcGlwZWxpbmVzOnRla3Rvbi1yZXN1bHRzLWRlYnVnIn0.VWzhu-bw3Ng-7erF4rZl3CkJVrLssabULWa_QTePWqT0AxSDf9ZR9vzaP1pstJyFL_S8HU4jsKTzpqxlzb5Tpk4IinJ19cMXx7GfrFzRt4YJdVar-DKQqn1ohV0J5qauP2lSEcI0OEkfJsufCvrfvKJMbAhvB-AeLrQmPFuFBxCgYdHHIje1SxCINmlJuqjTxNETyX_pf1d_CFfpN7j9a3S2hUyA5umAn8ezE7xQ4X33fu21KXWkSNKWEuYMaqzx71YXONAdpMQb0FXXdFS8moN-Adl4-eyJhbGciOiJSUzI1NiIsImtpZCI6IlU5OFJkVEQ3ZVV2T3puNjFheklxM3RUc2xSWGdDNFdHTjlfQWN4b1RGc3cifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiLCJrM3MiXSwiZXhwIjoxNzM0NzA1MDk5LCJpYXQiOjE3MzQ3MDE0OTksImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwianRpIjoiMDMxZWI5ZGMtMGQ2MC00YjAzLWEwNWItMzQyZjI3Mzk0NDhjIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJ0ZWt0b24tcGlwZWxpbmVzIiwic2VydmljZWFjY291bnQiOnsibmFtZSI6InRla3Rvbi1yZXN1bHRzLWRlYnVnIiwidWlkIjoiZTc5MGQwZTctZDJhYy00Njg3LWJiZjgtYjlkYmJhZTY5OTFkIn19LCJuYmYiOjE3MzQ3MDE0OTksInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDp0ZWt0b24tcGlwZWxpbmVzOnRla3Rvbi1yZXN1bHRzLWRlYnVnIn0.lVbJogflHSjZtrmC79dA9kKdEooLY4OGH2DVje5W9oXRlJHyihn-TD_P4qs1w9yYrRwgnzsvTl7Y0eT0CMcliIkQdvb3rva3ZkoTml809jzvSiA_bQVtfdAtlwWPPSpUO_f0AI8iMRL1YP8XgYC2qJvce0Z8A998hh-ma7SoxQWwrVNuVDKXI1nRbzQrZY4rupjonqtoOC8DuSt7zzWEAcVZESNDActLih5vs-muCZ3bgtAyNnMMcNTJr1_t9BIONyp8MKZ960K7JKriOvZBwTIzmiX4rJbZ_JMpko4_0me3zye3Wyh6d9UABUkj74rqM_9oVtJjVNsjmQAFRkaZiQ'
        }
      });
    },
    staleTime: 0,
    ...queryConfig
  });
  if (query.data?.records) {
    query.data.records.forEach(record => {
      return {
        ...record,
        data: {
          type: record.data.type,
          value: JSON.parse(atob(record.data.value))
        }
      };
    });
  }
  return query;
}
