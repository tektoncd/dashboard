<!--
---
linkTitle: "Logs"
weight: 4
---
-->

# Tekton Dashboard log viewer

This guide describes the features and functionality of the log viewer provided by the Tekton Dashboard on the `TaskRun` and `PipelineRun` details pages.

## Basic functionality

The Tekton Dashboard log viewer supports ANSI colour codes and text styles, and will automatically detect URLs in log content and render them as clickable links opening in a new window.

## Toolbar

The toolbar displayed in the log viewer includes a number of additional features, including:

- maximize: increase the area available to the log viewer by hiding the task list and run header. This allows the user to eliminate distractions from other parts of the app and focus on the log content.
- open in new window: open the raw logs in a separate browser window. This provides an unmodified and unprocessed view of the logs, without any of the added features provided by the log viewer.
- download: download the raw logs as a text file.
- user preferences: these are persisted to browser local storage and applied to all logs in the app. See the following sections for more details.

### Timestamps

The Dashboard will always request logs with timestamps from the Kubernetes pod logs API, and show / hide the timestamps in the log viewer based on the user's preference. This can be toggled from the settings menu in the toolbar at the top of the log viewer.

The timestamps are localised based on the user's browser settings, with the raw timestamp value received from the API provided as a tooltip on hover.

In releases prior to Tekton Dashboard v0.54, the timestamp preference was found on the Settings page, and governed whether or not timestamps were requested from the Kubernetes API server.

### Log levels

The log viewer parses log lines to detect the associated log level and decorate them accordingly to help with log consumability. The format supported is described below.

```
<timestamp> ::<level>::<message>
```

- `timestamp` is provided by the Kubernetes API server
- `level` is one of `error`, `warning`, `notice`, `info`, `debug`, `trace`
   - `debug` and `trace` logs are hidden by default
   - any log line without an explicit `level` is considered as `info`, but will not display the log level badge to avoid redundancy in the UI where users are not using the supported log format
- `message` is any other content on the line, and may contain ANSI codes for formatting, etc.

For example, the following snippet would output a log line at the `warning` level:

```sh
echo '::warning::Something that may require attention but is non-blocking…'
```

The displayed log levels can be changed via the settings menu in the toolbar at the top of the log viewer.

###  Log groups

In addition to log levels, the log viewer also supports collapsible groups within the logs. The format supported is described below.

```
<timestamp> ::group::<message>
…
<timestamp> ::endgroup::
```

A `group` command marks the beginning of the group. The content of `message` is displayed as the title / summary of the group along with an indicator of the group's current state (i.e. expanded or collapsed). Clicking the summary will toggle the state of the group.

Groups are rendered in the collapsed state by default unless the step is still in progress when the logs are viewed. The user can expand or collapse groups as desired and their state will be maintained until the user navigates to a different view.

Log groups cannot be mixed with log levels on the same line, the `group`, `endgroup`, and log level commands are mutually exclusive. However, logs contained within a group can use log levels as normal.

Nesting groups is not supported. A `group` command will implicitly terminate any prior unterminated group.

For example, the following snippet would output a log group with the summary 'Additional config' containing a number of messages at the `info` level:

```sh
echo '::group::Additional config'
echo 'This extends the base config'
echo '::info:: More info about the config…'
echo '::endgroup::'
```

## Logs persistence

By default, Tekton Dashboard loads the logs from the Kubernetes API server, using the pod logs API. However, it also supports loading logs from an external source when the container logs or the pods associated with the `TaskRuns` are no longer available on the cluster.

This functionality is described in detail, along with a full walk-through of an example configuration, in [Tekton Dashboard walk-through - Logs persistence](./walkthrough/walkthrough-logs.md).

It can be enabled by providing the `--external-logs` flag to the installer script, or configured directly in the Dashboard deployment's args.

When configured, the Dashboard will first attempt to load pod logs normally, and if they're unavailable will fallback to the provided external logs service by making a `GET` request to the provided endpoint with the following format:

```
GET <external-logs>/<namespace>/<podName>/<container>?startTime=<stepStartTime>&completionTime=<stepCompletionTime>
```

- `namespace`: the namespace containing the run
- `podName`: the name of the `Pod` resource associated with the selected `TaskRun`
- `container`: the name of the container associated with the selected `step`
- `stepStartTime`: the start time of the step container
- `stepCompletionTime`: the completion time of the step container

If the start / completion times are unavailable their respective query parameters will be omitted from the request.

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
