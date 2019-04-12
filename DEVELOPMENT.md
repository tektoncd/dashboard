# Developing

## Getting started

Many of the instructions here replicate what's in the [tektoncd/pipeline development guide](https://github.com/tektoncd/pipeline/blob/master/DEVELOPMENT.md), with a couple of caveats currently.

1. This project currently does not support being built with `ko`
2. This project has not yet been tested with GKE

We would love to accomplish both of these tasks and to update this document, contributions welcome!

### Requirements

You must install these tools:

1. [`go`](https://golang.org/doc/install): The language Tekton Dashboard is
   built in
1. [`git`](https://help.github.com/articles/set-up-git/): For source control
1. [`dep`](https://github.com/golang/dep): For managing external Go
   dependencies. - Please Install dep v0.5.0 or greater.
1. [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/): For
   interacting with your kube cluster
   
### Checkout your fork

The Go tools require that you clone the repository to the
`src/github.com/tektoncd/dashboard` directory in your
[`GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH).

To check out this repository:

1. Create your own
   [fork of this repo](https://help.github.com/articles/fork-a-repo/)
1. Clone it to your machine:

```shell
mkdir -p ${GOPATH}/src/github.com/tektoncd
cd ${GOPATH}/src/github.com/tektoncd
git clone git@github.com:${YOUR_GITHUB_USERNAME}/dashboard.git
cd dashboard
git remote add upstream git@github.com:tektoncd/dashboard.git
git remote set-url --push upstream no_push
```

_Adding the `upstream` remote sets you up nicely for regularly
[syncing your fork](https://help.github.com/articles/syncing-a-fork/)._

## Environment Setup

We recommend Docker building, pushing, and replacing the yaml in `install` to refer to your built and pushed image.

### Namespaces

Currently you must install the Tekton dashboard into the same namespace you wish to create and get Tekton resources in.

## Iterating

While iterating on the project, you may need to:

1. Docker build and push your image of the dashboard
1. Update your `install` yaml to refer to your image location
1. Run the Go tests, for example with: `docker build -f Dockerfile_test .`

Tekton Dashboard does not involve any custom resource definitions, we only interact with them.

## Install dashboard

After you've built and pushed the image, and modified the `install` yaml to refer to your image, you can stand up a version of the dashboard on-cluster (to your
`kubectl config current-context`):

```shell
kubectl apply -f `install/tekton-dashboard-deployment.yaml``
```

## Access the dashboard

To access the backend API:

`kubectl port-forward $(kubectl get pod -l app=tekton-dashboard -o name) 9097:9097`

Note that we have a big TODO which is to link up the frontend to the backend and to document how to build and run the frontend for yourself.

### Redeploy dashboard

As you make changes to the code, you can redeploy your dashboard by killing the pod and so the new container code will be used if it has been pushed. The pod is labelled with `tekton-dashboard` so you can do:

```shell
kubectl delete pod -l app=tekton-dashboard
```

### Tear it down

You can remove the deployment and any pods that were created with:

```shell
kubectl delete deployment -l app=tekton-dashboard-deployment
```

## Accessing logs

To look at the dashboard logs, run:

```shell
kubectl logs -l app=tekton-dashboard
```
