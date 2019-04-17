# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Tekton Dashboard is a general purpose, web-based UI for Tekton Pipelines. It allows users to manage and view Tekton Pipeline and Task runs and the resources involved in their creation, execution, and completion.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Getting Started

**Currently** to view the backend APIs, at `localhost:9097/v1/namespaces/<namespace>/<resource name>` for example:
  
```sh
$ kubectl apply -f tekton-dashboard-deployment.yaml
$ kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097
```

**Coming soon**
- All API definitions!
- Deploying the dashboard without using the install yaml, and accessing using kubectl proxy. To deploy the dashboard, execute the following command:

```sh
$ kubectl apply -f https://raw.githubusercontent.com/tektoncd/dashboard/...
```

To access the Tekton Dashboard from your local workstation you must create a secure channel to your Kubernetes cluster. Run the following command:

```sh
$ kubectl proxy
```
Now access the Dashboard at:

[`http://localhost:8001/api/v1/namespaces/tekton-pipelines/services/https:tekton-dashboard:/proxy/`](
http://localhost:8001/api/v1/namespaces/tekton-pipelines/https:tekton-dashboard:/proxy/).

## Want to contribute

We are so excited to have you!

- See [CONTRIBUTING.md](https://github.com/tektoncd/pipeline/blob/master/CONTRIBUTING.md) for an overview of our processes
- See [DEVELOPMENT.md](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md) for how to get started
