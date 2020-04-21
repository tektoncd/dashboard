# Tekton Dashboard CI/CD

This directory contains the Tekton `Tasks` and `Pipelines` used to create Dashboard releases.

These tasks run on your local cluster, and then copy the release artifacts - docker images and yaml files - into [the `tekton releases` bucket in Google Cloud Platform](https://console.cloud.google.com/storage/browser/tekton-releases/dashboard). Your cluster must contain keys from a Google account with the necessary authorization in order for this to work.

## Setup

> **Note:** 
> Depending on your cluster you may need to increase the memory allocated. 6GB is known to work on Docker Desktop.
> See https://github.com/tektoncd/pipeline/issues/2417 for details.

First, ensure that your credentials are set up correctly. You will need an account with access to [Google Cloud Platform](https://console.cloud.google.com). Your account must have 'proper authorization to release the images and yamls' in the [`tekton-releases` GCP project](https://github.com/tektoncd/plumbing#prow). Your account must have `Permission iam.serviceAccountKeys.create`. Contact @bobcatfish or @dlorenc if you are going to be creating dashboard releases and require this authorization.

- You will need to install the [`gcloud` CLI](https://cloud.google.com/sdk/gcloud/) in order to get keys out of Google Cloud and into your local cluster. These credentials will be patched onto the service account to be used by the Tekton PipelineRuns. You do not need to create a new GCP project or pay Google any money.
- It's convenient to use the ['tkn' CLI](https://github.com/tektoncd/cli) to kick off builds, so grab that as well.

```bash
KEY_FILE=release.json
GENERIC_SECRET=release-secret
# The kubernetes ServiceAccount that will be used by your Tekton tasks. 'default' is the default. It should already exist.
SERVICE_ACCOUNT=default
GCP_ACCOUNT="release-right-meow@tekton-releases.iam.gserviceaccount.com"

# 1. Create a GCP private key for the service account. It is vital to keep a copy safe since there is a limit of ten keys in total.
gcloud iam service-accounts keys create --iam-account $GCP_ACCOUNT $KEY_FILE

# 2. Sore GCP key in a secret
kubectl create secret generic $GENERIC_SECRET --from-file=./$KEY_FILE

# 3. Patch the GCP key onto the service account to be used to run the release pipeline.
kubectl patch serviceaccount $SERVICE_ACCOUNT -p "{\"secrets\": [{\"name\": \"$GENERIC_SECRET\"}]}"
```

Next:

1. Install [Tekton pipelines](https://github.com/tektoncd/pipeline) into your local cluster.
1. Create a GitHub release by pushing a tag to the [dashboard](https://github.com/tektoncd/dashboard) repository. This should be of the form, `vX.Y.Z' e.g.' 'v0.2.5'.
1. Change the `version` label in `base/300-deployment.yaml` to the same as the tag in the previous step.
1. Edit the `tekton-dashboard-git` PipelineResource in `resources.yaml` and set `spec.params.revision.value` to 'vX.Y.Z' e.g., `v0.2.5`. This can also be a git commit if you have not created a release yet.
1. From the root directory of the dashboard repository, create the Tekton Dashboard release pipeline:

```bash
PIPELINE_NAMESPACE=tekton-pipelines
kubectl apply -f tekton -n $PIPELINE_NAMESPACE
```

## Building a test release

You may want to run a test release first. To do this:

- Create a directory in the Google Cloud bucket
- Add that directory to the associated PipelineResource
- Apply your changes
- Run a test release
- Clean up

So for example, we might want to run one or more test releases under the name 'test-release'. 

- Go to https://console.cloud.google.com/storage/browser/tekton-releases/dashboard and click 'Create folder'. Create the folder Buckets/tekton-releases/dashboard/test-release.
- Modify the tekton-bucket-dashboard PipelineResource:

```yaml
apiVersion: tekton.dev/v1alpha1
kind: PipelineResource
metadata:
  name: tekton-bucket-dashboard
spec:
  type: storage
  params:
   - name: type
     value: gcs
   - name: location
     value: gs://tekton-releases/dashboard/test-release # If you're testing use your bucket name here instead of test-release
   - name: dir
     value: "y"
```

- Apply your changes

```bash
PIPELINE_NAMESPACE=tekton-pipelines
kubectl apply -f tekton -n $PIPELINE_NAMESPACE
```

Run a test release:

```bash
VERSION_TAG=test-1
PIPELINE_NAMESPACE=tekton-pipelines
tkn pipeline start dashboard-release -p versionTag=$VERSION_TAG -r dashboard-source-repo=tekton-dashboard-git -r bucket-for-dashboard=tekton-bucket-dashboard -r builtDashboardImage=dashboard-image -n $PIPELINE_NAMESPACE -s $SERVICE_ACCOUNT -p bucketName=mytestbucket
```

This will result in release artifacts appearing in the Google Cloud bucket `gs://tekton-releases/dashboard/mytestbucket/test-1`. If you need to run a second build, incremement $VERSION_TAG. Once you're finished, clean up:

- delete /mytestbucket from the PipelineResource and reapply your changes
- delete the temporary /mytestbucket bucket in Google Cloud

## Running a release build

Now you can kick off the release build:

```bash
VERSION_TAG=vX.Y.Z
PIPELINE_NAMESPACE=tekton-pipelines
tkn pipeline start dashboard-release -p versionTag=$VERSION_TAG -r dashboard-source-repo=tekton-dashboard-git -r bucket-for-dashboard=tekton-bucket-dashboard -r builtDashboardImage=dashboard-image -n $PIPELINE_NAMESPACE -s $SERVICE_ACCOUNT -p bucketName=latest
```

Monitor the build logs to see the image coordinates that the image is pushed to. The release yaml files should appear under https://console.cloud.google.com/storage/browser/tekton-releases/dashboard.

## Running the release pipeline on OpenShift

Run the following commands first

```

oc adm policy add-scc-to-user privileged -z default -n tekton-pipelines
oc adm policy add-scc-to-user anyuid -z default -n tekton-pipelines
```

to get around permission denied problems (as the build step uses `sudo`).

- Use a namespace other than default, e.g. the `tekton-pipelines` namespace
- Create your release secret and all Tekton resources in this namespace too
- Specify the namespace with the `tkn` command:

```
tkn pipeline start dashboard-release -p versionTag=v0.6.1 -r dashboard-source-repo=tekton-dashboard-git -r bucket-for-dashboard=tekton-bucket-dashboard -r builtDashboardImage=dashboard-image -n tekton-pipelines -s default -p bucketName=mytestbucket
```

## Manually complete the release work

We have a number of tasks that are yet to be automated:

- Write the release notes
- Attach `.yaml` files from https://console.cloud.google.com/storage/browser/tekton-releases/dashboard - be sure you copy the locked down image ones (look under `previous`): any containers such as `kubectl` and `oauth-proxy` should reference an image sha and not a tag such as `latest`
- Optionally repeat for the Webhooks Extension (automation in progress)
- Fix up image coordinates in `/README.md` for the normal and Openshift installs
- Publish the GitHub release
