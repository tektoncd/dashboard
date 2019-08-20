# Tekton Dashboard CI/CD

This directory contains the Tekton `Tasks` and `Pipelines` used to create Dashboard releases. 

These tasks run on your local cluster, and then copy the release artifacts - docker images and yaml files - into [the `tekton releases` bucket in Google Cloud Platform](https://console.cloud.google.com/storage/browser/tekton-releases/dashboard). Your cluster much contain keys from rom a google account with the necessary authorization in order for this to work. 

## Release process

First, ensure that your credentials are set up correctly. You will need an account with access to [Google Cloud Platform](https://console.cloud.google.com). Your account must have 'proper authorization to release the images and yamls' in the [`tekton-releases` GCP project](https://github.com/tektoncd/plumbing#prow). Your account must have `Permission iam.serviceAccountKeys.create`. Contact @bobcatfish or @dlorenc if you are going to be creating dashboard releases and require this authorization.

- You will need to install the [`gcloud` CLI](https://cloud.google.com/sdk/gcloud/) in order to get keys out of Google Cloud and into your local cluster. These credentials will be patched onto the service account to be used by the Tekton PipelineRuns. You do not need to create a new GCP project or pay Google any money. 
- It's convenient to use the ['tkn' CLI](https://github.com/tektoncd/cli) to kick off builds, so grab that as well. 

```bash
KEY_FILE=release.json
GENERIC_SECRET=release-secret
# The kubernetes ServiceAccount that will be used by your Tekton tasks. 'default' is the default. It should all ready exist. 
SERVICE_ACCOUNT=default 
GCP_ACCOUNT="release-right-meow@tekton-releases.iam.gserviceaccount.com"

# 1. Create a private key for the service account, which you can use
gcloud iam service-accounts keys create --iam-account $GCP_ACCOUNT $KEY_FILE

# 2. Create kubernetes secret, which we will use via a service account and directly mounting
kubectl create secret generic $GENERIC_SECRET --from-file=./$KEY_FILE

# 3. Add the docker secret to the service account
kubectl patch serviceaccount $ACCOUNT -p "{\"secrets\": [{\"name\": \"$GENERIC_SECRET\"}]}"
```

Next:

1. Install [Tekton pipelines](https://github.com/tektoncd/pipeline) into your local cluster. 
1. Create a GitHub release by pushing a tag to the [dashboard](https://github.com/tektoncd/dashboard) repository. This should be of the form, `vX.Y.Z' e.g.' 'v0.2.5'. 
1. Edit the `tekton-dashboard-git` PipelineResource in `resources.yaml` and set `spec.params.revision.value` to 'vX.Y.Z' e.g., `v0.2.5`. This can also be a git commit if you have not created a release yet. 
1. From the root directory of the dashboard repository, create the Tekton Dashboard release pipeline:
```bash
PIPELINE_NAMESPACE=tekton-pipelines
kubectl apply -f tekton -n $PIPELINE_NAMESPACE
``` 

Now you can kick of the release build:
```bash
VERSION_TAG=vX.Y.Z
PIPELINE_NAMESPACE=tekton-pipelines
tkn pipeline start dashboard-release -p versionTag=$VERSION_TAG -r source-repo=tekton-dashboard-git -r bucket=tekton-bucket -r builtDashboardImage=dashboard-image -n $PIPELINE_NAMESPACE
```

Monitor the build logs to see the image coordinates that the image is pushed to. The `release.yaml` should appear under https://console.cloud.google.com/storage/browser/tekton-releases/dashboard. 

## Manually fix the release up

We have a number of tasks that are yet to be automated:
- Fix the image tags of unpinned images in release.yaml until https://github.com/tektoncd/dashboard/pull/434 is merged
- Fix the image tags of unpinned images, and the newly generated images, in `config/openshift/openshift-tekton-dashboard.yaml`
- Write the release notes
- Attach the fixed up `release.yaml` and `openshift-tekton-dashboard.yaml` files
- Optionally repeat for the Webhooks Extension (not fully tested yet)
- Fix up image coordinates in `/README.md` for the normal and Openshift installs
- Publish the GitHub release