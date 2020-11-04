<!--
---
title: "Dashboard"
linkTitle: "Dashboard"
weight: 6
description: >
  General-Purpose, Web-Based UI
cascade:
  github_project_repo: https://github.com/tektoncd/dashboard
---
-->

{{% pageinfo %}}
This document is a work in progress.
{{% /pageinfo %}}

## Overview

Tekton provides a component, Tekton Dashboard, as a general-purpose,
web-based UI for Tekton Pipelines, which allows developers to:

* View and manage **taskRuns** and **pipelineRuns**
* View and manage resources associated with **taskRuns** and **pipelineRuns**
in their creation, execution, and completion

## Tutorial

Try out the [tutorial](https://katacoda.com/tektoncd/scenarios/tekton-dashboard) 
on Katacoda to install the Dashboard in a guided sandbox environment and explore 
some of its features.

## Installation

{{% tabs %}}

{{% tab "Kubernetes" %}}
To install the latest release of Tekton Dashboard, run the command below:

```bash
kubectl apply --filename https://github.com/tektoncd/dashboard/releases/latest/download/tekton-dashboard-release.yaml
```
{{% /tab %}}

{{% tab "OpenShift" %}}
To install the latest release of Tekton Dashboard, run the command below:

```bash
kubectl apply --filename https://github.com/tektoncd/dashboard/releases/latest/download/openshift-tekton-dashboard-release.yaml
```
{{% /tab %}}

{{% /tabs %}}

{{% alert title="Important" color="warning" %}}
The latest release **may not be compatible** with your Tekton Pipelines
installation, should you have an earlier release of Tekton Pipelines
installed. For more compatibility information, see the
[Tekton Dashboard's "Which version should I use?"](https://github.com/tektoncd/dashboard#which-version-should-i-use)
section.

If you would like to install an earlier release of Tekton Dashboard
for compatibility reasons, see the note below.
{{% /alert %}}

{{% alert title="Note" color="success" %}}
To install a different release of Tekton Dashboard, find the `.yaml` file
you would like to use on the [Tekton Dashboard Releases](https://github.com/tektoncd/dashboard/releases)
page, and run the command below:

```bash
# Replace YOUR-RELEASE with the URL of the release you would like to use.
kubectl apply --filename YOUR-RELEASE
```
{{% /alert %}}

It may take a few moments before the installation completes. You can check
the progress with the following command:

```sh
kubectl get pods --namespace tekton-pipelines
```

Confirm that every component listed has the status `Running`.

## Usage

Tekton Dashboard is accessible through its `cluster IP` type service with
a [reverse proxy](https://kubernetes.io/docs/tasks/extend-kubernetes/http-proxy-access-api/).
Run the following command:

```bash
kubectl proxy --port=8080
```

And you can open the dashboard in your browser under the address

```
localhost:8080/api/v1/namespaces/tekton-pipelines/services/tekton-dashboard:http/proxy/
```

It is also possible to set up port forwarding with Tekton Dashboard:

```bash
kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097
```

Once set up, the dashboard is available in the browser under the address
`localhost:9097`.

## What's next

Try out some of our [walkthroughs](./walkthrough) for more details on deploying and configuring the
Tekton Dashboard for some common scenarios. For more information, see the
[Tekton Dashboard GitHub repository](https://github.com/tektoncd/dashboard).
