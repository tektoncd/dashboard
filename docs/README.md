<!--

---
linkTitle: Dashboard
weight: 6
cascade:
  github_project_repo: https://github.com/tektoncd/dashboard
---

-->

# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/tektoncd/dashboard/blob/main/LICENSE)
[![Go Report Card](https://goreportcard.com/badge/tektoncd/dashboard)](https://goreportcard.com/report/tektoncd/dashboard)

<p align="center">
  <img src="tekton-dashboard-color.svg" alt="Tekton Dashboard logo (Tekton cat inspecting resources with a magnifying glass)" width="200" />
</p>

Tekton Dashboard is a general purpose, web-based UI for [Tekton Pipelines](https://github.com/tektoncd/pipeline) and [Tekton triggers](https://github.com/tektoncd/triggers) resources.

It allows users to manage and view Tekton resource creation, execution, and completion.

Some of the features the Tekton Dashboard supports:
- Realtime view of `PipelineRun` and `TaskRun` status and logs
- Filter resources by label
- View resource overview and YAML
- Show resources for the whole cluster or limit visibility to a particular namespace
- Import resources directly from a git repository
- Add functionality through extensions

![Dashboard UI workloads page](dashboard-ui.jpg)

## Getting Started

- Try out the [tutorial](./tutorial.md) to install the Dashboard and explore some of its features

- For more details about installation options, access control, and customisation, see the [install doc](./install.md)

## Further reading

- Try our [walk-throughs](./walkthrough/README.md) for more details on deploying and configuring the Tekton Dashboard for some common scenarios
- Learn how to add additional resource types to the Tekton Dashboard using [extensions](./extensions.md)
- Take a look at our [roadmap](https://github.com/tektoncd/dashboard/blob/main/roadmap.md)

## Which version should I use?

| Version | Docs | Pipelines | Triggers |
| ------- | ---- | --------- | -------- |
| [HEAD](https://github.com/tektoncd/dashboard/blob/main/DEVELOPMENT.md) | [Docs @ HEAD](https://github.com/tektoncd/dashboard/tree/main/docs) | v0.35.x - v0.39.x | v0.15.x - 0.21.x |
| [v0.29.1](https://github.com/tektoncd/dashboard/releases/tag/v0.29.1) | [Docs @ v0.29.1](https://github.com/tektoncd/dashboard/tree/v0.29.1/docs) | v0.35.x - v0.39.x | v0.15.x - 0.21.x |
| [v0.28.0](https://github.com/tektoncd/dashboard/releases/tag/v0.28.0) | [Docs @ v0.28.0](https://github.com/tektoncd/dashboard/tree/v0.28.0/docs) | v0.35.x - v0.37.x | v0.15.x - 0.20.x |
| [v0.27.0](https://github.com/tektoncd/dashboard/releases/tag/v0.27.0) | [Docs @ v0.27.0](https://github.com/tektoncd/dashboard/tree/v0.27.0/docs) | v0.25.x - v0.36.x | v0.15.x - 0.20.x |
| [v0.26.0](https://github.com/tektoncd/dashboard/releases/tag/v0.26.0) | [Docs @ v0.26.0](https://github.com/tektoncd/dashboard/tree/v0.26.0/docs) | v0.25.x - v0.35.x | v0.15.x - 0.19.x |
| [v0.25.0](https://github.com/tektoncd/dashboard/releases/tag/v0.25.0) | [Docs @ v0.25.0](https://github.com/tektoncd/dashboard/tree/v0.25.0/docs) | v0.25.x - v0.34.x | v0.15.x - 0.19.x |
| [v0.24.2](https://github.com/tektoncd/dashboard/releases/tag/v0.24.2) | [Docs @ v0.24.2](https://github.com/tektoncd/dashboard/tree/v0.24.2/docs) | v0.25.x - v0.32.x | v0.15.x - 0.18.x |
| [v0.23.1](https://github.com/tektoncd/dashboard/releases/tag/v0.23.1) | [Docs @ v0.23.1](https://github.com/tektoncd/dashboard/tree/v0.23.1/docs) | v0.25.x - v0.30.x | v0.15.x - 0.17.x |
| [v0.22.1](https://github.com/tektoncd/dashboard/releases/tag/v0.22.1) | [Docs @ v0.22.1](https://github.com/tektoncd/dashboard/tree/v0.22.1/docs) | v0.25.x - v0.29.x | v0.15.x - 0.17.x |

<details>
  <summary>Other versions</summary>

  It is **strongly recommended** to use the **v0.22.1, v0.23.1, v0.24.2, or v0.25.0** releases or newer.
  - These releases contain a security fix
  - Earlier versions are deprecated and should be used for **development or isolated usage only**

  For details of earlier versions, see [legacy releases](./legacy-releases.md)
</details>

## Browser support

The Tekton Dashboard has been tested on modern evergreen browsers.

It generally supports the current and previous stable versions of:

- Google Chrome (Windows, macOS, Linux)
- Mozilla Firefox (Windows, macOS, Linux)
- Apple Safari (macOS)
- Microsoft Edge (Windows)

Older versions or other browsers may work, but some features may be missing or not function as expected.

## Want to contribute

We are so excited to have you!

- Feature requests and bug reports welcome, please [open an issue](https://github.com/tektoncd/dashboard/issues/new/choose)
- See [CONTRIBUTING.md](https://github.com/tektoncd/dashboard/blob/main/CONTRIBUTING.md) for an overview of our processes
- See [DEVELOPMENT.md](https://github.com/tektoncd/dashboard/blob/main/DEVELOPMENT.md) for how to get started
- Look at our
  [good first issues](https://github.com/tektoncd/dashboard/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
  and our
  [help wanted issues](https://github.com/tektoncd/dashboard/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
