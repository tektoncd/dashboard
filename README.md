# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Tekton Dashboard is a general purpose, web-based UI for Tekton Pipelines. It allows users to manage and view Tekton Pipeline and Task runs and the resources involved in their creation, execution, and completion.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Getting Started

[coming soon] To deploy the dashboard, execute the following command:

```
sh
$ kubectl apply -f https://raw.githubusercontent.com/tektoncd/dashboard/...
```

To access the Tekton Dashboard from your local workstation you must create a secure channel to your Kubernetes cluster. Run the following command:

```sh
$ kubectl proxy
```
Now access Dashboard at:

[`http://localhost:8001/api/v1/namespaces/tekton-pipelines/services/https:tekton-dashboard:/proxy/`](
http://localhost:8001/api/v1/namespaces/tekton-pipelines/https:tekton-dashboard:/proxy/).


## Want to contribute

We are so excited to have you!

- See [CONTRIBUTING.md](https://github.com/tektoncd/pipeline/blob/master/CONTRIBUTING.md) for an overview of our processes
- See [DEVELOPMENT.md](https://github.com/tektoncd/pipeline/blob/master/DEVELOPMENT.md) for how to get started


## Development Notes

Current back-end deployment notes:-

```
$ docker build -t YOUR_DOCKERHUB_ID/back-end .
$ docker push YOUR_DOCKERHUB_ID/back-end
```

Edit install/tekton-dashboard-deployment.yaml and replace `CHANGE_ME` with YOUR_DOCKERHUB_ID, and save the file

```
$ kubectl apply -f ./install/tekton-dashboard-deployment.yaml
```

You can now port-forward to directly access the backend code.  If running in local kube environment you should be able to simply

```
$ kubectl get pods
$ kubectl port-forward <dashboard_pod_name> 9097:9097
```

You should now be able to hit the REST endpoints in the backend code at localhost:9097