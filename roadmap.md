# Tekton Dashboard Roadmap

In 2019 we created a web-based UI to observe and inspect Tekton resources, both those created by the core Tekton Pipeline project, and by Tekton Triggers.

In 2020 we would like to continue adding new features to make this experience even better, as well as ensuring it remains stable and reliable.

This is an incomplete list of work we hope to accomplish this year.

## Currency
- continue adding support for latest Pipeline ([roadmap](https://github.com/tektoncd/pipeline/blob/master/roadmap.md)) and Triggers ([roadmap](https://github.com/tektoncd/triggers/blob/master/roadmap.md)) releases
- this includes support for workspaces, retries, improved display of conditions, etc.
- we also want to have a Dashboard beta release

## Observability
- which Trigger resulted in which PipelineRun or TaskRun?
- it should be easy for a user to navigate between related resources for more details, as well as surfacing some relevant information in context in the PipelineRun and TaskRun views

## Platform support
- currently known to work on GKE (read-only at least) and some versions of OpenShift
- we've mostly used Docker Desktop for local development of the Dashboard, but should also make it easy to develop on some other common platforms (OpenShift CodeReady Containers works)
- document known good combinations and improve cross-platform testing
- this includes documentation for auth in supported environments

## Consistency
- improve consistency across resource types
- use a common layout on core pages. A good chunk of this is done already, need to update remaining pages and ensure it's applied to any new resource types as they're added
- ensure all resource types provide a core feature set, e.g. list, delete, view YAML, etc.

## Authentication / authorization
- document common patterns for auth in different scenarios / different platforms, e.g. oauth-proxy with OpenShift
- introduce ability to deploy a more locked down version of dashboard, e.g. access to a single namespace

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
