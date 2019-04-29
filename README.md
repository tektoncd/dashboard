# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Tekton Dashboard is a general purpose, web-based UI for Tekton Pipelines. It allows users to manage and view Tekton Pipeline and Task runs and the resources involved in their creation, execution, and completion.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Getting Started

**Currently** to view the dashboard, at `localhost:9097/` 
 
If you have `ko`:

Log in to Dockerhub and then use `ko`, for example:

```sh
$ docker login
$ export KO_DOCKER_REPO=docker.io/<mydockername>
$ npm install
$ npm run build_ko
$ ko apply -f config
```

This will build and push an image of the Tekton dashboard to a Dockerhub repository under your account.

Alternatively you can do the following:

```sh
$ docker build -t <mydockername>/dashboard:<mytag> .
$ docker push <mydockername>/dashboard:<mytag>
- Replace the image path at `config/tekton-dashboard-deployment.yaml` with the value for <mydockername>/dashboard:<mytag>
- Replace the WEB_RESOURCES_DIR value in the same file with the value __./web__
$ kubectl apply -f tekton-dashboard-deployment.yaml
```

Regardless of which installation mechanism you choose, do the following to access the dashboard: 

```sh
$ kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097
```

- Visit [localhost:9097](http://localhost:9097) in your web browser.

**Coming soon**
- Deploying the dashboard without using the `config/` yaml, and accessing using kubectl proxy. To deploy the dashboard, execute the following command:

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
