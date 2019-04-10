# devops-back-end

devops-back-end is comprised of:

- REST APIs for interaction and control of Tekton Pipelines and Knative Eventing/Eventing-sources resources 
- An event-handler implementation to create dynamic Tekton PipelineRuns in response to GitHub webhook events

Follow the [install documentation](https://github.ibm.com/swiss-cloud/devops-back-end/blob/master/INSTALL.md) to set up the REST APIs and event-handler implementation

## Triggering PipelineRuns from your GitHub repository events:

- Use `POST /v1/namespaces/<namespace>/githubsource/` REST API to create GitHubSource resource (see the example)

- Verify a webhook was created successfully on your repository, then push code to your repository.

A PipelineRun will be created for you, as will the PipelineResources that reference the Git commit ID of your newly committed code and image coordinates.

Observe as your code is checked out, built and pushed to your remote registry and your application is deployed.

## API definitions

Access the API endpoints at the defined domain for your Knative service - for example this will be something like:

`devops-back-end-service.<your namespace>.<your configured custom domain>/v1/namespaces/<namespace>/pipeline/`

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
GET /v1/namespaces/<namespace>/githubsource                              - get all githubsources
GET /v1/namespaces/<namespace>/githubsource/<name>                       - get githubsource <name>

GET /v1/websocket/logs                                                   - WIP, get websocket stream of logs

GET /v1/namespaces/<namespace>/knative/installstatus                     - get install status of a Knative resource group -> the request body should contain the resource group to check for. Shorthand values are accepted for Knative serving and eventing-sources: use ("component": "serving" or "eventing-sources"). Any Kubernetes group can be used too, for example: `extensions/v1beta1`.

Returns http 204 if the component is installed (any Kubernetes resource can be provided)
Returns http 400 if a bad request is sent
Returns http 417 (expectation failed) if the resource is not registered

Note that a check of the resource definition being registered is performed: not that pods are running and healthy.


```

POST endpoints:
```
POST /                                                                   - handles a webhook. Creates a PipelineRun that builds and deploys your project.
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

POST /v1/namespaces/<namespace>/githubsource                             - create new githubsource  -> request body must contain name, gitrepositoryurl, accesstoken, and pipeline.  It may contain registrysecret, helmsecret, and repositorysecretname 
```

PUT endpoints:
```
PUT /v1/namespaces/<namespace>/credentials/<id>                          - update credential <id>       -> request body must contain username, password, and type ('accesstoken' or 'userpass')
PUT /v1/namespaces/<namespace>/githubsource/<name>                       - update githubsource  <name>  -> request body must contain name, gitrepositoryurl, accesstoken, and pipeline.  It may contain registrysecret, helmsecret, and repositorysecretname 
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
DELETE /v1/namespaces/<namespace>/githubsource/<name>                    - delete githubsource <name>
```
## API example

```
Create GithubSource example:
 
curl -X POST --header "Content-Type: application/json" \
-d "{\"name\": \"test1\", \"gitrepositoryurl\": \"https://github.com/microclimate-dev2ops/microclimateGoTemplate\", \"accesstoken\": \"testaccesstoken\", \
\"pipeline\":\"simple-helm-pipeline\", \"registrysecret\":\"testRegistorySecret\", \"helmsecret\":\"helmsecret\"}" \
http://<API ENDPOINT IP:PORT>/v1/namespaces/<INSTALLED NAMESPACE>/githubsource/
```