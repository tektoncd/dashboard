# Tekton Dashboard CI/CD

_Why do Tekton projects have a folder called `tekton`? Cuz we think it would be cool
if the `tekton` folder were the place to look for CI/CD logic in most repos!_

We dogfood our project by using Tekton to build, test, and release
Tekton! This directory contains the
[`Tasks`](https://github.com/tektoncd/pipeline/blob/main/docs/tasks.md) and
[`Pipelines`](https://github.com/tektoncd/pipeline/blob/main/docs/pipelines.md)
that we use.

- [Tekton Dashboard CI/CD](#tekton-dashboard-cicd)
  - [Create an official release](#create-an-official-release)
  - [Create a patch release](#create-a-patch-release)
  - [Nightly builds](#nightly-builds)
  - [Setup](#setup)
    - [Install Tekton](#install-tekton)
    - [Install pipeline](#install-pipeline)
    - [Service account and secrets](#service-account-and-secrets)
  - [Update infra](#update-infra)
  - [NPM Packages](#npm-packages)

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

## Nightly builds

The nightly build pipeline is triggered by [a GitHub Actions scheduled workflow](https://github.com/tektoncd/dashboard/actions/workflows/nightly-build.yml).

This uses the same `Pipeline` and `Task`s as an official release.

If you need to manually trigger a nightly build:

- Navigate to the [nightly build workflow](https://github.com/tektoncd/dashboard/actions/workflows/nightly-build.yml)
- Click 'Run workflow'
- Optionally provide a Kubernetes version or storage bucket (you will typically leave these alone and use the default values)
- Click 'Run workflow'

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
kubectl apply --filename  https://infra.tekton.dev/tekton-releases/pipeline/previous/v${TEKTON_VERSION}/release.yaml
```

### Install pipeline

Apply the release pipeline from the `dashboard` repo:
```bash
kubectl apply -f tekton/release-pipeline.yaml
```

The release pipeline references required tasks via remote resolvers, so the tasks do not need to be manually applied to the cluster.

`Tasks` and `Pipelines` from this repo are:

- [`build.yaml`](build.yaml) - This `Task` builds the UI bundles and places them
  in the `kodata` directory to be picked up by the backend
- [`publish.yaml`](publish.yaml) - This `Task` uses
  [`ko`](https://github.com/google/ko) to build all of the container images we
  release and generate the `release.yaml`
- [`release-pipeline.yaml`](./release-pipeline.yaml) - This `Pipeline`
  uses the above `Task`s, along with others from the catalog.

### Service account and secrets

In order to release, these Pipelines use the `release-right-meow` service account,
which uses `release-secret` and has write access to the storage buckets which are exposed to users at [tekton-nightly](https://infra.tekton.dev/tekton-nightly) and [tekton-releases](https://infra.tekton.dev/tekton-releases).

The release infrastructure and config is managed via tektoncd/plumbing and tektoncd/infra.

## Update infra

To update the Dashboard release on the [infra cluster](https://tekton.infra.tekton.dev/):

1. Open a PR to update the version at https://github.com/tektoncd/plumbing/blob/bbf941e0cddd2dd1393ddfe56d33393860f924be/tekton/cd/dashboard/overlays/oci-ci-cd/kustomization.yaml#L6
2. Once merged, wait for the deployment to complete
3. Ensure the Dashboard has been updated (check the About page) and is working correctly

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
