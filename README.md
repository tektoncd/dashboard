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


## Development notes

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

## API definitions

The backend API offers the following endpoints at `/v1/namespaces/<namespace>`:

GET endpoints:
```
GET /v1/namespaces/<namespace>/pipeline                                  - get all pipelines
GET /v1/namespaces/<namespace>/pipeline/<pipeline-name>                  - get <pipeline-name> pipeline
GET /v1/namespaces/<namespace>/pipelinerun                               - get all pipelineruns, also supports '?repository=https://gitserver/foo/bar' querying
GET /v1/namespaces/<namespace>/pipelinerun/<pipelinerun-name>            - get <pipelinerun-name> pipelinerun
GET /v1/namespaces/<namespace>/task                                      - get all tasks
GET /v1/namespaces/<namespace>/task/<task-name>                          - get <task-name> task
GET /v1/namespaces/<namespace>/taskrun                                   - get all taskruns
GET /v1/namespaces/<namespace>/taskrun/<taskrun-name>                    - get <taskrun-name> taskrun
GET /v1/namespaces/<namespace>/pipelineresource                          - get all pipelineresources
GET /v1/namespaces/<namespace>/pipelineresource/<pipelineresource-name>  - get <pipelineresource-name> pipelineresource
GET /v1/namespaces/<namespace>/log/<pod-name>                            - get log of <pod-name> pod
GET /v1/namespaces/<namespace>/taskrunlog/<taskrun-name>                 - get log of <taskrun-name> taskrun
GET /v1/namespaces/<namespace>/credentials                               - get all credentials
GET /v1/namespaces/<namespace>/credentials/<id>                          - get credential <id>

GET /v1/websocket/logs                                                   - WIP, get websocket stream of logs

GET /v1/namespaces/<namespace>/knative/installstatus                     - get install status of a Knative resource group -> the request body should contain the resource group to check for. Shorthand values are accepted for Knative serving and eventing-sources: use ("component": "serving" or "eventing-sources"). Any Kubernetes group can be used too, for example: `extensions/v1beta1`.

Returns http 204 if the component is installed (any Kubernetes resource can be provided)
Returns http 400 if a bad request is sent
Returns http 417 (expectation failed) if the resource is not registered

Note that a check of the resource definition being registered is performed: not that pods are running and healthy.


```

POST endpoints:
```
POST /v1/namespaces/<namespace>/credentials                              - create new credential    -> request body must contain id, username, password, and type ('accesstoken' or 'userpass')
POST /v1/namespaces/<namespace>/pipelinerun                              - creates a new manual PipelineRun based on a specified Pipeline     
-> request body must contain pipelinename, optional parameters may be provided in the request body depending on requirements of the Pipeline.

pipelineruntype can be specifed as 'helm' if your Pipeline is deploying with helm.

gitresourcename, gitcommit, and repourl can be provided in the request body if your Pipeline requires a PipelineResource of type `git`
imageresourcename, git commit and reponame can be provided in the request body if your Pipeline requires a PipelineResource of type `image`

helmsecret and registrysecret are optional depending on whether the Pipeline requires secrets for accessing an insecure registry or using helm.

Returns http 204 if the PipelineRun was created successfully (no content provided in the response)
Returns 400 if a bad request was used
Returns 412 if the Pipeline template to create the PipelineRun from could not be found

```

PUT endpoints:
```
PUT /v1/namespaces/<namespace>/credentials/<id>                          - update credential <id>       -> request body must contain username, password, and type ('accesstoken' or 'userpass')
PUT /v1/namespaces/<namespace>/pipelinerun/<pipelinerun-name>            - update pipelinerun status    -> request body must contain desired status ("status: "PipelineRunCancelled" to cancel a running one). 

Returns http 204 if the PipelineRun was cancelled successfully (no contents are provided in the response)
Returns http 400 if a bad request was used
Returns http 404 if the requested PipelineRun could not be found 
Returns http 412 if the status was already set to that
Returns http 500 if the PipelineRun could not be stopped (an error has occurred when updating the PipelineRun)

```

DELETE endpoint:
```
DELETE /v1/namespaces/<namespace>/credentials/<id>                       - delete credential <id>
```
