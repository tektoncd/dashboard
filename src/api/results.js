/*
Copyright 2026 The Tekton Authors
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

import { get } from './comms';
import { apiRoot } from './utils';

const resultsAPIRoot = `${apiRoot}/apis/results.tekton.dev/v1alpha2`;

// Lists Results (one per top-level PipelineRun, or standalone TaskRun) for a
// namespace, paginated via page_token. Returns the lightweight `summary` on
// each Result (name/type/status/start/end) -- callers rendering a list/table
// should use that directly rather than fetching and decoding every Record.
export function listResults({ namespace, pageSize, pageToken } = {}) {
  const params = new URLSearchParams();
  // Results are 1:1 with top-level PipelineRuns (child TaskRuns are stored
  // as separate Records under their parent PipelineRun's Result, not as
  // their own Result), except for a standalone TaskRun run outside any
  // Pipeline, which gets its own Result too -- filter those out here.
  params.set('filter', 'summary.type==PIPELINE_RUN');
  // Without an explicit order, Results returns whatever order its storage
  // happens to have them in -- newest-first is what a "recently deleted
  // runs" page should default to.
  params.set('order_by', 'create_time desc');
  if (pageSize) {
    params.set('page_size', pageSize);
  }
  if (pageToken) {
    params.set('page_token', pageToken);
  }
  return get(`${resultsAPIRoot}/parents/${namespace}/results?${params}`);
}

// Fetches a single Record and returns the decoded PipelineRun/TaskRun object
// (base64-decoded + JSON-parsed from the Record's data.value).
export async function getRecord({ recordName }) {
  const record = await get(`${resultsAPIRoot}/parents/${recordName}`);
  return JSON.parse(atob(record.data.value));
}

// Lists the TaskRun Records stored under a parent Result (identified by the
// PipelineRun's own result name, "<namespace>/results/<uid>"). TaskRun
// Records are looked up this way -- by parent result UID -- rather than by
// name or label, since names get reused over time.
export function listChildTaskRunRecords({ resultName }) {
  const params = new URLSearchParams();
  params.set('filter', 'data_type=="tekton.dev/v1.TaskRun"');
  return get(`${resultsAPIRoot}/parents/${resultName}/records?${params}`);
}

// Finds every PipelineRun/TaskRun Record matching a name, newest first.
// Uses the "-" wildcard to search Records across every Result in the
// namespace, since Results indexes by namespace+UID, not by name, and the
// UID is gone once the live object no longer exists to ask. Names get
// reused over time, so more than one Record can genuinely match -- callers
// that need a single answer (see findRecordByName) have to pick one; the
// /history search box instead shows every match and lets a human pick.
export async function searchRecordsByName({ dataType, name, namespace }) {
  const params = new URLSearchParams();
  params.set(
    'filter',
    `data_type=="${dataType}" && data.metadata.name=="${name}"`
  );
  params.set('order_by', 'create_time desc');
  const { records } = await get(
    `${resultsAPIRoot}/parents/${namespace}/results/-/records?${params}`
  );
  return (records || []).map(record => ({
    decoded: JSON.parse(atob(record.data.value)),
    resultName: record.name.split('/records/')[0]
  }));
}

// Finds a PipelineRun/TaskRun Record by name when only {namespace, name} are
// known (the detail page route never has the k8s UID that Results actually
// indexes by). KNOWN GAP: names get reused over time, so more than one
// Record can match; this takes the most recently created one as a
// best-effort guess and can surface the wrong run if a name was reused.
export async function findRecordByName({ dataType, name, namespace }) {
  const matches = await searchRecordsByName({ dataType, name, namespace });
  return matches[0] || null;
}
