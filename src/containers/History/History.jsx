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

import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Search, usePrefix } from '@carbon/react';
import { Pending as DefaultIcon } from '@carbon/react/icons';
import {
  FormattedDate,
  FormattedDuration,
  StatusFilterDropdown,
  StatusIcon,
  Table
} from '@tektoncd/dashboard-components';
import {
  ALL_NAMESPACES,
  generateId,
  getStatus,
  getStatusFilter,
  getStatusFilterHandler,
  runMatchesStatusFilter,
  urls
} from '@tektoncd/dashboard-utils';

import {
  listResults,
  searchRecordsByName,
  useSelectedNamespace
} from '../../api';

// runMatchesStatusFilter/getStatus only ever read run.status.conditions[0]
// (a plain {type, status, reason} object in standard k8s Condition shape)
// -- they don't care whether the object is a live watched resource or not.
// A RecordSummary's flat `status` enum (SUCCESS/FAILURE/TIMEOUT/CANCELLED/
// UNKNOWN) isn't that shape, so this maps it to one, matching the same
// status/reason combinations Tekton itself would report (confirmed against
// this project's own stress-test data, which reported real PipelineRuns as
// reason="PipelineRunTimeout" for the TIMEOUT case).
const summaryStatusToCondition = {
  CANCELLED: { reason: 'PipelineRunCancelled', status: 'False' },
  FAILURE: { reason: 'Failed', status: 'False' },
  SUCCESS: { reason: 'Succeeded', status: 'True' },
  TIMEOUT: { reason: 'PipelineRunTimeout', status: 'False' },
  UNKNOWN: { reason: 'Running', status: 'Unknown' }
};

function toFilterableRun(status) {
  return {
    status: {
      conditions: [{ type: 'Succeeded', ...summaryStatusToCondition[status] }]
    }
  };
}

const headers = [
  { key: 'name', header: 'PipelineRun' },
  { key: 'status', header: 'Status' },
  { key: 'startTime', header: 'Start Time' },
  { key: 'duration', header: 'Duration' }
];

// Counts occurrences of each name among currently-loaded rows, so links can
// carry a disambiguating ?resultUID= only when it's actually needed (a
// name shows up more than once) rather than on every link. This only knows
// about whatever's already loaded -- see getSummaryRow.
function countByName(items, getName) {
  return items.reduce((counts, item) => {
    const name = getName(item);
    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});
}

// Mirrors the status cell PipelineRuns' own list renders (same StatusIcon,
// CSS classes, and reason/message layout) instead of a generic pill, so a
// TIMEOUT/FAILURE row here looks identical to the live list.
function renderStatusCell(run) {
  const { message, reason, status } = getStatus(run);
  return (
    <div>
      <div className="tkn--definition">
        <div
          className="tkn--status"
          data-reason={reason}
          data-status={status}
          title={message ? `${reason}: ${message}` : reason}
        >
          <StatusIcon
            DefaultIcon={props => <DefaultIcon size={24} {...props} />}
            reason={reason}
            status={status}
          />
          {reason || 'Pending'}
        </div>
      </div>
      {status === 'False' && message ? (
        <span className="tkn--table--sub" title={message}>
          {message}&nbsp;
        </span>
      ) : (
        <span className="tkn--table--sub">&nbsp;</span>
      )}
    </div>
  );
}

function buildRow({
  durationMs,
  isDuplicateName,
  name,
  namespace,
  run,
  startTime,
  uid
}) {
  const to = isDuplicateName
    ? `${urls.pipelineRuns.byName({ name, namespace })}?resultUID=${uid}`
    : urls.pipelineRuns.byName({ name, namespace });

  return {
    id: uid,
    name: <Link to={to}>{name}</Link>,
    status: renderStatusCell(run),
    startTime: <FormattedDate date={startTime} relative />,
    duration:
      durationMs != null ? <FormattedDuration milliseconds={durationMs} /> : '-'
  };
}

// Result.name is "<namespace>/results/<k8s uid>" -- that k8s uid is what
// Results addresses records by (and what the detail page needs for
// ?resultUID=). Result.uid is a separate, database-internal id and must
// NOT be used for that, even though it's tempting since it's right there.
function getResultNamespaceAndUID(result) {
  return result.name.split('/results/');
}

function getResultDisplayName(result) {
  const [, uid] = getResultNamespaceAndUID(result);
  return result.annotations?.['object.metadata.name'] || uid;
}

// Only PipelineRuns get their own Result (child TaskRuns are stored as
// Records under their parent PipelineRun's Result), so every row here is a
// deleted-or-not PipelineRun -- see src/api/results.js for details.
function getSummaryRow(result, isDuplicateName) {
  const { summary } = result;
  const [namespace, uid] = getResultNamespaceAndUID(result);
  const name = getResultDisplayName(result);
  const durationMs =
    summary.end_time && summary.start_time
      ? new Date(summary.end_time).getTime() -
        new Date(summary.start_time).getTime()
      : null;

  return buildRow({
    durationMs,
    isDuplicateName,
    name,
    namespace,
    run: toFilterableRun(summary.status),
    startTime: summary.start_time,
    uid
  });
}

// Search results come back as full decoded PipelineRun records rather than
// the lightweight Result summary (searchRecordsByName has to decode to
// filter by name), so the fields are read from a k8s-shaped object instead --
// getStatus/renderStatusCell work identically on it, no adapting needed.
function getSearchRow({ decoded }, isDuplicateName) {
  const { metadata, status } = decoded;
  const durationMs =
    status?.completionTime && status?.startTime
      ? new Date(status.completionTime).getTime() -
        new Date(status.startTime).getTime()
      : null;

  return buildRow({
    durationMs,
    isDuplicateName,
    name: metadata.name,
    namespace: metadata.namespace,
    run: decoded,
    startTime: status?.startTime,
    uid: metadata.uid
  });
}

export function History() {
  const prefix = usePrefix();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { selectedNamespace } = useSelectedNamespace();
  const { namespace = selectedNamespace } = params;

  const statusFilter = getStatusFilter(location);
  const setStatusFilter = getStatusFilterHandler({ location, navigate });

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const isSearching = !!searchTerm;
  const resultsNamespace = namespace === ALL_NAMESPACES ? '-' : namespace;

  const listQuery = useInfiniteQuery({
    enabled: !isSearching,
    queryKey: ['history', 'listResults', namespace],
    queryFn: ({ pageParam }) =>
      listResults({ namespace: resultsNamespace, pageToken: pageParam }),
    initialPageParam: '',
    getNextPageParam: lastPage => lastPage.next_page_token || undefined
  });

  const searchQuery = useQuery({
    enabled: isSearching,
    queryKey: ['history', 'search', namespace, searchTerm],
    queryFn: () =>
      searchRecordsByName({
        dataType: 'tekton.dev/v1.PipelineRun',
        name: searchTerm,
        namespace: resultsNamespace
      })
  });

  const searchItems = (searchQuery.data || []).filter(({ decoded }) =>
    runMatchesStatusFilter({ run: decoded, statusFilter })
  );
  const searchNameCounts = countByName(
    searchItems,
    ({ decoded }) => decoded.metadata.name
  );

  const summaryItems = (listQuery.data?.pages || [])
    .flatMap(page => page.results || [])
    .filter(result =>
      runMatchesStatusFilter({
        run: toFilterableRun(result.summary.status),
        statusFilter
      })
    );
  const summaryNameCounts = countByName(summaryItems, getResultDisplayName);

  const rows = isSearching
    ? searchItems.map(match =>
        getSearchRow(match, searchNameCounts[match.decoded.metadata.name] > 1)
      )
    : summaryItems.map(result =>
        getSummaryRow(
          result,
          summaryNameCounts[getResultDisplayName(result)] > 1
        )
      );

  const isLoading = isSearching ? searchQuery.isPending : listQuery.isPending;
  const error = isSearching ? searchQuery.error : listQuery.error;

  return (
    <div className="tkn--history">
      <div className="tkn--list-page--header">
        <h1 id="main-content-header" tabIndex={-1}>
          History
        </h1>
      </div>
      {/* Reuses LabelFilter's own "tkn--label-filter"/"tkn--filters" classes
          (see packages/components/.../_LabelFilter.scss) so the reserved
          chip-row spacing below the search box matches PipelineRuns/
          Pipelines/TaskRuns/Tasks pixel-for-pixel, even though History's
          plain-text search has no tag chips of its own to put in that slot. */}
      <div className="tkn--label-filter">
        <Search
          labelText="Search by PipelineRun name"
          onChange={event => setSearchInput(event.target.value)}
          onClear={() => {
            setSearchInput('');
            setSearchTerm('');
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setSearchTerm(searchInput.trim());
            }
          }}
          placeholder="Search by PipelineRun name, press Enter"
          size="lg"
          value={searchInput}
        />
        <div className="tkn--filters" />
      </div>
      {error && <p>Error loading History: {error.message}</p>}
      <Table
        emptyTextAllNamespaces={
          isSearching
            ? `No PipelineRuns found matching "${searchTerm}"`
            : 'No results found in any namespace'
        }
        emptyTextSelectedNamespace={
          isSearching
            ? `No PipelineRuns found matching "${searchTerm}" in namespace ${namespace}`
            : `No results found in namespace ${namespace}`
        }
        filters={
          <StatusFilterDropdown
            id={generateId('history-status-filter-')}
            initialSelectedStatus={statusFilter}
            onChange={({ selectedItem }) => {
              setStatusFilter(selectedItem.id);
            }}
          />
        }
        hasDetails
        headers={headers}
        loading={isLoading}
        rows={rows}
        selectedNamespace={namespace}
      />
      {rows.length > 0 && (
        // Results' page_token is an opaque forward-only cursor -- there's
        // no total count or random page access the way the k8s-backed
        // lists get from Carbon's own <Pagination>, so this reuses that
        // component's CSS classes (same look/spacing/theme) around a
        // "Load more" control instead of trying to force-fit the real
        // <Pagination> component's page-jumping semantics onto it.
        <div className={`${prefix}--pagination`}>
          <div className={`${prefix}--pagination__left`}>
            <span
              className={`${prefix}--pagination__text ${prefix}--pagination__items-count`}
            >
              {rows.length} {rows.length === 1 ? 'item' : 'items'} loaded
            </span>
          </div>
          {!isSearching && (
            <div
              className={`${prefix}--pagination__right ${prefix}--pagination__right--no-content`}
            >
              <span
                className={`${prefix}--pagination__text ${prefix}--pagination__page-text ${prefix}--pagination__unknown-pages-text`}
              >
                {listQuery.hasNextPage ? 'More available' : 'All loaded'}
              </span>
              <div className={`${prefix}--pagination__control-buttons`}>
                <Button
                  disabled={
                    !listQuery.hasNextPage || listQuery.isFetchingNextPage
                  }
                  kind="ghost"
                  onClick={() => listQuery.fetchNextPage()}
                  size="sm"
                >
                  {listQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
