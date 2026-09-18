<!--
---
linkTitle: "History"
weight: 5
---
-->

# Tekton Dashboard History

This guide describes the optional `/history` view, which lets you browse PipelineRuns and TaskRuns that have been **deleted from the cluster** (for example by a pruner, TTL, or manual cleanup), backed by [Tekton Results](https://github.com/tektoncd/results).

This is disabled by default.

## Enabling History

Provide the `--results-api` flag to the installer script (or set it directly in the Dashboard deployment's args), pointing at the base URL (scheme + host) of your Tekton Results API server:

```bash
curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/main/scripts/release-installer | \
  bash -s -- install latest --read-write --results-api <results-api-url>
```

This requires Tekton Results to already be installed and configured to retain the PipelineRuns/TaskRuns you want to browse after deletion. See the [Tekton Results documentation](https://github.com/tektoncd/results/tree/main/docs) for installing and configuring Results itself.

When `--results-api` is not set, the "History" navigation entry and the `/history` route are both absent, and the PipelineRun/TaskRun details pages behave exactly as they do today (no fallback lookups, no extra network calls).

## TLS

The Dashboard authenticates to the Results API using its own ServiceAccount's bearer token, and expects the Results API to present a certificate trusted by the system certificate pool -- the same expectation already in place for `--external-logs`. If your Results API server uses a self-signed or private-CA certificate, ensure that CA is trusted by the Dashboard's container (for example by adding it to the pod's trust store), rather than relying on the Dashboard to skip verification.

## What's available

- **`/history`**: a paginated, searchable list of PipelineRuns sourced from Results (only top-level PipelineRuns are listed; TaskRuns started as part of a Pipeline are shown as part of that PipelineRun's detail page, exactly as they are for live runs).
- **PipelineRun / TaskRun detail pages**: if a PipelineRun or TaskRun can no longer be found via the Kubernetes API, the existing detail page transparently falls back to loading it from Results instead, using the same PipelineRun graph, TaskRun status/timing, and log viewer components used for live runs.
- **Logs**: History does not depend on Results for log content. Step logs are served exactly as configured via [`--external-logs`](./logs.md) -- Results is only used to recover the full TaskRun object (including `status.podName` and `status.steps[].container`) needed to construct the same external-logs request used for live runs.

## Known gaps

- **Name collisions**: PipelineRun/TaskRun names can be reused after deletion. `/history` disambiguates same-named entries via a `?resultUID=` query parameter on detail-page links; navigating to a detail page directly by name (without that parameter) falls back to the most recently created match.
- **Pod/Events**: since the originating Pod no longer exists, the "Pod" tab and Kubernetes Events are unavailable for Results-sourced runs.
- **No separate RBAC**: History uses the Dashboard's own ServiceAccount to talk to Results; it does not currently support per-user access control beyond what the Dashboard itself enforces for the live cluster view.
- **List/live reconciliation**: `/history` is a separate view from the live PipelineRuns/TaskRuns lists rather than a merged view, since Results' cursor-based pagination doesn't reconcile cleanly with the Kubernetes list+watch model those lists use today. This is an open design question -- see the discussion on the PR that introduced this feature for context.

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
