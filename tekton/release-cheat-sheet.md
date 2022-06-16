# Tekton Dashboard Official Release Cheat Sheet

These steps provide a no-frills guide to performing an official release
of Tekton Dashboard. To follow these steps you'll need a checkout of
the dashboard repo, a terminal window and a text editor.

1. [Setup a context to connect to the dogfooding cluster](#setup-dogfooding-context) if you haven't already.

1. `cd` to root of Dashboard git checkout.

1. Select the commit you would like to build the release from, most likely the
   most recent commit at https://github.com/tektoncd/dashboard/commits/main
   and note the commit's hash.

1. Create environment variables for bash scripts in later steps.

    ```bash
    TEKTON_VERSION=# Example: v0.19.0
    TEKTON_RELEASE_GIT_SHA=# SHA of the release to be released
    ```

1. Confirm commit SHA matches what you want to release.

    ```bash
    git show $TEKTON_RELEASE_GIT_SHA
    ```

1. Create a workspace template file:

   ```bash
   cat <<EOF > workspace-template.yaml
   spec:
     accessModes:
     - ReadWriteOnce
     resources:
       requests:
         storage: 5Gi
   EOF
   ```

1. Execute the release pipeline.

   **If you are back-porting include this flag: `--param=releaseAsLatest="false"`**

    ```bash
    tkn --context dogfooding pipeline start dashboard-release \
      --serviceaccount=release-right-meow \
      --param=gitRevision="${TEKTON_RELEASE_GIT_SHA}" \
      --param=serviceAccountPath=release.json \
      --param=versionTag="${TEKTON_VERSION}" \
      --param=releaseBucket=gs://tekton-releases/dashboard \
      --workspace name=release-secret,secret=release-secret \
      --workspace name=workarea,volumeClaimTemplateFile=workspace-template.yaml
    ```

1. Watch logs of dashboard-release.

1. Once the pipeline run is complete, check its results:

    ```bash
    tkn --context dogfooding pr describe <pipeline-run-name>

    (...)
    📝 Results

    NAME                                         VALUE
    commit-sha                                   6ea31d92a97420d4b7af94745c45b02447ceaa19
    tekton-dashboard-release                     https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.19.0/tekton-dashboard-release.yaml
    tekton-dashboard-release-readonly            https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.19.0/tekton-dashboard-release-readonly.yaml
    tekton-dashboard-openshift-release           https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.19.0/openshift-tekton-dashboard-release.yaml
    tekton-dashboard-openshift-release-readonly  https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.19.0/openshift-tekton-dashboard-release-readonly.yaml

    (...)
    ```

    The `commit-sha` should match `$TEKTON_RELEASE_GIT_SHA`.
    The URLs can be opened in the browser or via `curl` to download the release manifests.

1. The YAMLs are now released! Anyone installing Tekton Dashboard will now get the new version. Time to create a new GitHub release announcement

## Create a release announcement

**TODO:** adapt the [create-draft-release](https://github.com/tektoncd/plumbing/blob/main/tekton/resources/release/base/github_release.yaml) `Task` used by tektoncd/pipeline for the Dashboard's needs

Creating the release announcement is currently a manual process but will be automated in future.

1. [Draft a new release](https://github.com/tektoncd/dashboard/releases/new)

1. Copy the format from an existing release and insert details of the relevant changes and contributors.

1. Add any upgrade and deprecation notices as required.

1. Attach the release manifests to the release: `tekton-dashboard-*.yaml` and `openshift-tekton-dashboard-*.yaml`.

1. Once the release notes are ready, un-check the "This is a pre-release" checkbox since you're making a legit for-reals release!

1. Publish the GitHub release once all notes are correct and in order.

## Post-release tasks

1. Edit `README.md` on `main` branch, add entry to docs table with latest release links.

1. Push & make PR for updated `README.md`

1. Test the release that you just made against your own cluster (note `--context my-dev-cluster`):

     ```bash
     # Test latest
     kubectl --context my-dev-cluster apply --filename     https://storage.googleapis.com/tekton-releases/dashboard/latest/tekton-dashboard-release.yaml
     ```

     ```bash
     # Test backport
     kubectl --context my-dev-cluster apply --filename     https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.19.2/tekton-dashboard-release.yaml
     ```

1. Announce the release in Slack channels #general, #announcements, and #dashboard.

1. Update the website sync config to include the new release by adding the new tag to the top of the list in https://github.com/tektoncd/website/blob/main/sync/config/dashboard.yaml

Congratulations, you're done!

## Setup dogfooding context

1. Configure `kubectl` to connect to
   [the dogfooding cluster](https://github.com/tektoncd/plumbing/blob/main/docs/dogfooding.md):

    ```bash
    gcloud container clusters get-credentials dogfooding --zone us-central1-a --project tekton-releases
    ```

1. Give [the context](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)
   a short memorable name such as `dogfooding`:

   ```bash
   kubectl config rename-context gke_tekton-releases_us-central1-a_dogfooding dogfooding
   ```

## Important: Switch `kubectl` back to your own cluster by default.

    ```bash
    kubectl config use-context my-dev-cluster
    ```
