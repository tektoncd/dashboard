# Developing

## Getting started

Many of the instructions here replicate what's in the [tektoncd/pipeline development guide](https://github.com/tektoncd/pipeline/blob/master/DEVELOPMENT.md), with a couple of caveats currently.

1. This project currently does not support being built with `ko`
2. This project has not yet been tested with GKE
3. The instructions here pertain to building the backend that lets us interact with Tekton resources. Frontend instructions are to follow.

We would love to accomplish these tasks and to update this document, contributions welcome!

### Requirements

You must install these tools:

1. [`go`](https://golang.org/doc/install): The language Tekton Dashboard is
   built in
1. [`git`](https://help.github.com/articles/set-up-git/): For source control
1. [`dep`](https://github.com/golang/dep): For managing external Go
   dependencies. - Please Install dep v0.5.0 or greater.
1. [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/): For
   interacting with your kube cluster. 
   
   Note that there exists a bug in certain versions of `kubectl` whereby the `auth` field is missing from created secrets. Known good versions we've tested are __1.11.3__ and __1.13.2__.
   
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

- We've had good success using Docker Desktop: ensure your Kubernetes cluster is healthy and you have plenty of disk space allocated as PVs will be created for PipelineRuns.
- Ensure you can push images to a Docker registry - the above listed requirements are only for local development, otherwise we pull in the tooling for you in the image.

### Namespaces

Currently you must install the Tekton dashboard into the same namespace you wish to create and get Tekton resources in.

## Iterating

While iterating on the project, you may need to:

1. Docker build and push your image of the dashboard
1. Run the Go tests with: `docker build -f Dockerfile_test .`
1. Replace the `image` reference in the yaml located in the `install` folder to reference your built and pushed image's location
1. Install the dashboard
1. Interact with the created Kubernetes service - we've had success using Postman on Mac and data provided must be JSON

Tekton Dashboard does not involve any custom resource definitions, we only interact with them.

## Install dashboard

After you've built and pushed the image, and modified the `install` yaml to refer to your image, you can stand up a version of the dashboard on-cluster (to your
`kubectl config current-context`):

```shell
kubectl apply -f `install`
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

## API definitions

The backend API offers the following endpoints at `/v1/namespaces/<namespace>`:

GET endpoints:
```
GET /v1/namespaces/<namespace>/pipeline
Get all Tekton Pipelines
Returns HTTP code 200 and a list of Pipelines in the given namespace
Returns HTTP code 404 if an error occurred getting the Pipeline list

GET /v1/namespaces/<namespace>/pipeline/<pipeline-name>
Get a Tekton Pipeline by name
Returns HTTP code 200 and the given pipeline in the given namespace if found
Returns HTTP code 404 if an error occurred getting the Pipeline

GET /v1/namespaces/<namespace>/pipelinerun
Get all Tekton PipelineRuns, also supports '?repository=https://gitserver/foo/bar' querying
Returns HTTP code 200 and a list of PipelineRuns, optionally matching the above query, in the given namespace
Returns HTTP code 404 if an error occurred getting the PipelineRun list

GET /v1/namespaces/<namespace>/pipelinerun/<pipelinerun-name>
Get a Tekton PipelineRun by name
Returns HTTP code 200 and the given PipelineRun in the given namespace
Returns HTTP code 404 if an error occurred getting the PipelineRun

GET /v1/namespaces/<namespace>/task
Get all Tekton tasks
Returns HTTP code 200 and a list of Tasks in the given namespace 
Returns HTTP code 404 if an error occurred getting the Task list

GET /v1/namespaces/<namespace>/task/<task-name>
Get a Tekton Task by name

GET /v1/namespaces/<namespace>/taskrun
Get all Tekton TaskRuns
Returns HTTP code 200 and a list of TaskRuns in the given namespace 
Returns HTTP code 404 if an error occurred getting the TaskRun list

GET /v1/namespaces/<namespace>/taskrun/<taskrun-name>
Get a Tekton TaskRun by name

GET /v1/namespaces/<namespace>/pipelineresource
Get all Tekton PipelineResources
Returns HTTP code 200 and a list of PipelineResources in the given namespace 
Returns HTTP code 404 if an error occurred getting the PipelineRun list

GET /v1/namespaces/<namespace>/pipelineresource/<pipelineresource-name>
Get a Tekton PipelineResource by name

GET /v1/namespaces/<namespace>/log/<pod-name>
Get the logs for a Pod by name

GET /v1/namespaces/<namespace>/taskrunlog/<taskrun-name>
Get the logs for a TaskRun by name- get log of <taskrun-name> taskrun

GET /v1/namespaces/<namespace>/credentials
Get all credentials by name in the given namespace

GET /v1/namespaces/<namespace>/credentials/<id>
Get a credential by ID

GET /v1/websocket/logs
WIP, get a websocket stream of logs

GET /v1/namespaces/<namespace>/knative/installstatus                     
Get the install status of a Knative resource group .
The request body should contain the resource group to check for. Shorthand values are accepted for Knative serving and eventing-sources: use ("component": "serving" or "eventing-sources"). Any Kubernetes group can be used too, for example: `extensions/v1beta1`

Returns HTTP code 204 if the component is installed (any Kubernetes resource can be provided)
Returns HTTP code 400 if a bad request is sent
Returns HTTP code 417 (expectation failed) if the resource is not registered
Note that a check of the resource definition being registered is performed: not that pods are running and healthy.
```

POST endpoint:
```
POST /v1/namespaces/<namespace>/credentials
Create a new credential
Request body must contain id, username, password, and type ('accesstoken' or 'userpass')
```

PUT endpoints:
```
PUT /v1/namespaces/<namespace>/credentials/<id>                          
Update credential by ID
Request body must contain username, password, and type ('accesstoken' or 'userpass')

PUT /v1/namespaces/<namespace>/pipelinerun/<pipelinerun-name>
Update pipelinerun status
Request body must contain desired status ("status": "PipelineRunCancelled" to cancel a running one). 

Returns HTTP code 204 if the PipelineRun was cancelled successfully (no contents are provided in the response)
Returns HTTP code 400 if a bad request was used
Returns HTTP code 404 if the requested PipelineRun could not be found 
Returns HTTP code 412 if the status was already set to that
Returns HTTP code 500 if the PipelineRun could not be stopped (an error has occurred when updating the PipelineRun)
```

DELETE endpoint:
```
DELETE /v1/namespaces/<namespace>/credentials/<id>
Delete a credential by ID
```
