# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Tekton Dashboard is a general purpose, web-based UI for Tekton Pipelines. It allows users to manage and view Tekton Pipeline and Task runs and the resources involved in their creation, execution, and completion.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Install Dashboard
To install the Dashboard using `ko`:
```sh
$ docker login
$ export KO_DOCKER_REPO=docker.io/<mydockername>
$ npm install
$ npm run build_ko
$ ko apply -f config
```

The `ko apply` command will build and push an image of the Tekton Dashboard to the Docker registry which you are logged into. Any Docker registry will do, but in this case it will push to Dockerhub.

The Dashboard can also be installed without `ko`:

```sh
$ docker build -t <mydockername>/dashboard:<mytag> .
$ docker push <mydockername>/dashboard:<mytag>
```
- Replace the image path at `config/tekton-dashboard.yaml` with the value for <mydockername>/dashboard:<mytag>
- Replace the WEB_RESOURCES_DIR value in the same file with the value __./web__
```
$ kubectl apply -f config
```

## Install on Minishift

1. Install [tektoncd-pipeline-operator](https://github.com/openshift/tektoncd-pipeline-operator#deploy-openshift-pipelines-operator-on-minikube-for-testing)
2. [Checkout](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md#checkout-your-fork) the repository
3. Install deployment config `$oc process -f config/templates/deploy.yaml | oc apply -f-`
4. Install build config `$oc process -f build.yaml | oc apply -f-`

## Accessing Dashboard
The Dashboard has can be accessed through its ClusterIP Service by running `kubectl proxy`. Assuming default is the install namespace for the dashboard, you can access the web UI at `localhost:8001/api/v1/namespaces/default/services/tekton-dashboard:http/proxy/`

## Want to contribute

We are so excited to have you!

- See [CONTRIBUTING.md](https://github.com/tektoncd/pipeline/blob/master/CONTRIBUTING.md) for an overview of our processes
- See [DEVELOPMENT.md](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md) for how to get started
