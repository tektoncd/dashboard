# Tekton Dashboard Roadmap

In 2019 we created a web-based UI to observe and inspect Tekton resources, both those created by the core Tekton Pipelines project, and by Tekton Triggers. 2020 brought new functionality, improved configurability, and a redesigned UI.

In 2021 and beyond we would like to continue adding new features to make this experience even better, as well as ensuring it remains stable and reliable.

This is an incomplete list of work we hope to accomplish.

## Currency
- continue adding support for latest Pipelines ([roadmap](https://github.com/tektoncd/pipeline/blob/master/roadmap.md)) and Triggers ([roadmap](https://github.com/tektoncd/triggers/blob/master/roadmap.md)) releases
- this includes support for workspaces, Custom Tasks (i.e. the Run CRD), etc.
- we also want to have a Dashboard beta release

## Observability
- which Trigger resulted in which PipelineRun or TaskRun?
- it should be easy for a user to navigate between related resources for more details, as well as surfacing some relevant information in context in the PipelineRun and TaskRun views

## Consistency
- improve consistency across resource types
- ensure all resource types provide a core feature set, e.g. list, delete, view YAML, etc. Most of this is done already, need to update the few remaining pages and ensure the same pattern is applied to any new resource types as they're added.

## Authentication / authorization
- document common patterns for auth in different scenarios / different platforms, e.g. oauth-proxy with OpenShift
- introduce ability to deploy a more locked down version of dashboard, e.g. access to a single namespace

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
