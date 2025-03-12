# Tekton Dashboard CI/CD

_Why do Tekton projects have a folder called `tekton`? Cuz we think it would be cool
if the `tekton` folder were the place to look for CI/CD logic in most repos!_

We dogfood our project by using Tekton to build, test, and release
Tekton! This directory contains the
[`Tasks`](https://github.com/tektoncd/pipeline/blob/main/docs/tasks.md) and
[`Pipelines`](https://github.com/tektoncd/pipeline/blob/main/docs/pipelines.md)
that we use.

* [How to create a release](#create-an-official-release)
* [How to create a patch release](#create-a-patch-release)
* [Automated nightly releases](#nightly-releases)
* [Setup releases](#setup)
* [Update dogfooding](#update-dogfooding)
* [npm packages](#npm-packages)

## Create an official release

To create an official release, follow the steps in the [release-cheat-sheet](./release-cheat-sheet.md)

## Create a patch release

Sometimes we'll find bugs that we want to backport fixes for into previous releases
or discover things that were missing from a release that are required by upstream
consumers of a project. In that case we'll make a patch release. To make one:

1. On the PR for the change you want to backport add a comment:
   ```
   /cherrypick <branch>
   ```
   where `<branch>` is the target release branch.
   For example, to backport a fix to v0.43.x:
   ```
   /cherrypick release-v0.43.x-lts
   ```
   This will create a new PR cherry picking the relevant change onto the target branch.
1. Review the PR as normal
1. Repeat steps above for any other changes to be backported
1. [Create an official release](#create-an-official-release) for the patch, with the
   [patch version incremented](https://semver.org/)

## Nightly releases

The nightly release pipeline is
[triggered nightly by Tekton](https://github.com/tektoncd/plumbing/tree/main/tekton).

This uses the same `Pipeline` and `Task`s as an official release.

If you need to manually trigger a nightly release, switch to the `dogfooding` context and run the following:

`kubectl create job --from=cronjob/nightly-cron-trigger-dashboard-nightly-release dashboard-nightly-$(date +"%Y%m%d-%H%M")`

## Setup

To start from scratch and use these `Pipeline`s and `Task`s:

1. [Install Tekton](#install-tekton)
1. [Setup the Tasks and Pipelines](#install-tasks-and-pipelines)
1. [Create the required service account + secrets](#service-account-and-secrets)

### Install Tekton

```bash
# If this is your first time installing Tekton in the cluster you might need to give yourself permission to do so
kubectl create clusterrolebinding cluster-admin-binding-someusername \
  --clusterrole=cluster-admin \
  --user=$(gcloud config get-value core/account)

# Example, Tekton v0.29.0
export TEKTON_VERSION=0.29.0
kubectl apply --filename  https://storage.googleapis.com/tekton-releases/pipeline/previous/v${TEKTON_VERSION}/release.yaml
```

### Install tasks and pipelines

Add all the `Tasks` to the cluster, including the
[`git-clone`](https://github.com/tektoncd/catalog/tree/main/task/git-clone) and 
[`gcs-upload`](https://github.com/tektoncd/catalog/tree/main/task/gcs-upload)
Tasks from the
[`tektoncd/catalog`](https://github.com/tektoncd/catalog), and the
[release](https://github.com/tektoncd/plumbing/tree/main/tekton/resources/release) Tasks from
[`tektoncd/plumbing`](https://github.com/tektoncd/plumbing).

Use a version of the [`tektoncd/catalog`](https://github.com/tektoncd/catalog)
tasks that is compatible with version of Tekton being released, usually `main`.
Install Tasks from plumbing too:

```bash
# Apply the Tasks we are using from the catalog
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.2/git-clone.yaml
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/gcs-upload/0.1/gcs-upload.yaml
# Apply the Tasks we are using from tektoncd/plumbing
kubectl apply -f https://raw.githubusercontent.com/tektoncd/plumbing/main/tekton/resources/release/base/prerelease_checks.yaml
```

Apply the tasks from the `dashboard` repo:
```bash
# Apply the Tasks and Pipelines we use from this repo
kubectl apply -f tekton/build.yaml
kubectl apply -f tekton/publish.yaml
kubectl apply -f tekton/release-pipeline.yaml
```

`Tasks` and `Pipelines` from this repo are:

- [`build.yaml`](build.yaml) - This `Task` builds the UI bundles and places them
  in the `kodata` directory to be picked up by the backend
- [`publish.yaml`](publish.yaml) - This `Task` uses
  [`ko`](https://github.com/google/ko) to build all of the container images we
  release and generate the `release.yaml`
- [`release-pipeline.yaml`](./release-pipeline.yaml) - This `Pipeline`
  uses the above `Task`s

### Service account and secrets

In order to release, these Pipelines use the `release-right-meow` service account,
which uses `release-secret` and has
[`Storage Admin`](https://cloud.google.com/container-registry/docs/access-control)
access to
[`tekton-releases`]((https://github.com/tektoncd/plumbing/blob/main/gcp.md))
and
[`tekton-releases-nightly`]((https://github.com/tektoncd/plumbing/blob/main/gcp.md)).

After creating these service accounts in GCP, the kubernetes service account and
secret were created with:

```bash
KEY_FILE=release.json
GENERIC_SECRET=release-secret
ACCOUNT=release-right-meow

# Connected to the `prow` in the `tekton-releases` GCP project
GCP_ACCOUNT="$ACCOUNT@tekton-releases.iam.gserviceaccount.com"

# 1. Create a private key for the service account
gcloud iam service-accounts keys create $KEY_FILE --iam-account $GCP_ACCOUNT

# 2. Create kubernetes secret, which we will use via a service account and directly mounting
kubectl create secret generic $GENERIC_SECRET --from-file=./$KEY_FILE

# 3. Add the docker secret to the service account
kubectl patch serviceaccount $ACCOUNT \
  -p "{\"secrets\": [{\"name\": \"$GENERIC_SECRET\"}]}"
```

## Update dogfooding

To update the Dashboard release on the [`dogfooding` cluster](https://dashboard.dogfooding.tekton.dev/):

1. Ensure you have a valid context for the `robocat` cluster in your kubeconfig
1. Run the following script from `tektoncd/plumbing`:
   ```
   ./scripts/deploy-release.sh -p dashboard -v <version>
   ```
   where `<version>` is the desired Dashboard release version, e.g. `v0.43.0`
1. Wait for the new pod to be ready, should only take a few seconds
1. Ensure the Dashboard has been updated (check the About page) and is working correctly

## NPM Packages

To release a new version of the npm packages, e.g. `@tektoncd/dashboard-components`:

1. Prereqs:
    1. Ensure you are at the root of the project
    1. Check out the HEAD of the branch you wish to publish from, typically `main`
    1. Verify that your working directory is clean
    - Note: This process will intentionally exit early if your git working directory is not clean
1. `npm run version:packages -- <type>` where type is one of `prerelease` or `preminor`
    - `prerelease` will bump `0.24.1-alpha.0` to `0.24.1-alpha.1`
    - `preminor` will bump `0.24.1-alpha.2` to `0.25.0-alpha.0` and should be used for the first publish after a new Dashboard release
    - Note: On Windows you may need to set the npm script-shell to git-bash, e.g.: `npm config set script-shell "C:\\Program Files\\Git\\bin\\bash.exe"`
1. Push the change to your fork and open a PR
   - The command above should have created a commit with the correct message format and version
     > `Publish v<version> of the @tektoncd/dashboard-* packages`

     e.g. `Publish v0.24.1-alpha.0 of the @tektoncd/dashboard-* packages`
   - Use the commit message as the PR title
1. The packages are automatically published once the PR is merged
   - Verify there were no issues with the [publish workflow](https://github.com/tektoncd/dashboard/actions/workflows/publish.yml?query=event%3Apush+branch%3Amain)
1. Once the packages are published, build and publish the Storybook:
   1. `npm run storybook:build`
   1. `npm run storybook:deploy` - optional, deploys to your fork's (origin) pages
   1. `npm run storybook:deploy -- --remote upstream` - deploys to the `tektoncd/dashboard` repo's pages
   1. Verify that the updated version is available at https://tektoncd.github.io/dashboard/
