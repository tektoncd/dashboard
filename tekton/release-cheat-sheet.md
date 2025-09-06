# Tekton Dashboard Official Release Cheat Sheet

These steps provide a no-frills guide to performing an official release
of Tekton Dashboard. To follow these steps you'll need a checkout of
the dashboard repo, a terminal window and a text editor.

1. [Setup a context to connect to the release cluster](#setup-context) if you haven't already.

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

   **Note:** Change the context name in the following commands if using the GCP `dogfooding` cluster instead

    ```bash
    tkn --context tekton-ci-cd pipeline start dashboard-release \
      --serviceaccount=release-right-meow \
      --param=gitRevision="${TEKTON_RELEASE_GIT_SHA}" \
      --param=imageRegistry=ghcr.io \
      --param=imageRegistryPath=tektoncd/dashboard \
      --param=imageRegistryRegions="" \
      --param=imageRegistryUser="tekton-robot" \
      --param=koExtraArgs="" \
      --param=serviceAccountPath=release.json \
      --param=serviceAccountImagesPath=credentials \
      --param=versionTag="${TEKTON_VERSION}" \
      --param=releaseBucket=gs://tekton-releases/dashboard \
      --workspace name=release-secret,secret=release-secret \
      --workspace name=release-images-secret,secret=ghcr-creds \
      --workspace name=workarea,volumeClaimTemplateFile=workspace-template.yaml
    ```

1. Watch logs of dashboard-release.

1. Once the PipelineRun is complete, check its results:

    ```bash
    tkn --context tekton-ci-cd pr describe <pipeline-run-name>

    (...)
    📝 Results

    NAME             VALUE
    ∙ commit-sha     41751e228930c03a1e310d548bc2c529747ca423
    ∙ release-file   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.61.0/release.yaml
    ∙ release-file-full   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.61.0/release-full.yaml
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
   - You can find the Rekor UUID by running `rekor-cli search --sha $DASHBOARD_IMAGE_SHA`
   - For LTS releases ensure this is included in the title and description

1. Add any upgrade and deprecation notices as required.

1. Attach the release manifests to the release: `release.yaml` and `release-full.yaml`.

1. Once the release notes are ready, un-check the "This is a pre-release" checkbox since you're making a legit for-reals release!

1. Publish the GitHub release once all notes are correct and in order.

1. Create a branch for the release named `release-v<version number>.x`, e.g. [`release-v0.28.x`](https://github.com/tektoncd/dashboard/tree/release-v0.28.x)
   and push it to the repo https://github.com/tektoncd/dashboard.
   (This can be done on the Github UI.)
   Make sure to fetch the commit specified in `TEKTON_RELEASE_GIT_SHA` to create the released branch.

   For LTS releases the branch should be named `release-v<version number>.x-lts`, e.g. [`release-v0.32.x-lts`](https://github.com/tektoncd/dashboard/tree/release-v0.32.x-lts).

## Post-release tasks

1. If the release requires a new minimum version of Kubernetes,
   edit `install.md` on the `main` branch and add the new requirement in the
   "Pre-requisites" section

1. Edit `releases.md` on the `main` branch, add an entry for the release.
   - In case of a patch release, replace the latest release with the new one,
     including links to docs and examples. Append the new release to the list
     of patch releases as well.
   - In case of a minor or major release, add a new entry for the
     release, including links to docs
   - Check if any release is EOL, if so move it to the "End of Life Releases"
     section

1. Push & make PR for updated `releases.md` and `install.md`

1. Test the release that you just made against your own cluster (note `--context my-dev-cluster`):

     ```bash
     # Test latest
     kubectl --context my-dev-cluster apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/release-full.yaml
     ```

     ```bash
     # Test backport
     kubectl --context my-dev-cluster apply --filename https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.32.0/release-full.yaml
     ```

1. Announce the release in Slack channels #general, #announcements, and #dashboard.

1. Update [the plumbing repo](https://github.com/tektoncd/plumbing/blob/d244554a42d7b6a5f1180c58c513eeecc9febcde/tekton/cd/dashboard/overlays/oci-ci-cd/kustomization.yaml#L4) to deploy the latest version to the `tekton-ci-cd` cluster on OCI.

1. For major releases, update the [website sync config](https://github.com/tektoncd/website/blob/main/sync/config/dashboard.yaml) to include the new release branch at the top of the list.

Congratulations, you're done!

## Setup context

### GCP dogfooding cluster

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

### OCI tekton-ci-cd cluster

1. Configure `kubectl` to connect to the cluster:
    ```bash
    oci ce cluster create-kubeconfig --cluster-id $CLUSTER_OCID --file $HOME/.kube/config --region $CLUSTER_REGION --token-version 2.0.0 --kube-endpoint PUBLIC_ENDPOINT
    ```

1. Give the context a short memorable name such as `tekton-ci-cd`:

   ```bash
   kubectl config rename-context cluster-c3h3zdippcq tekton-ci-cd
   ```

## Important: Switch `kubectl` back to your own cluster by default.

```bash
kubectl config use-context my-dev-cluster
```
