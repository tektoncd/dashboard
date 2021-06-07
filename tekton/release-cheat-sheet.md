# Tekton Dashboard Official Release Cheat Sheet

These steps provide a no-frills guide to performing an official release
of Tekton Dashboard. To follow these steps you'll need a checkout of
the dashboard repo, a terminal window and a text editor.

1. [Setup a context to connect to the dogfooding cluster](#setup-dogfooding-context) if you haven't already.

2. `cd` to root of Dashboard git checkout.

3. 1. Make sure the release `Task` and `Pipeline` are up-to-date on the
      cluster.

   - [publish-dashboard-release](https://github.com/tektoncd/dashboard/blob/main/tekton/publish.yaml)

     This task uses [ko](https://github.com/google/ko) to build all container images we release and generate the `release.yaml`
     ```shell script
     kubectl apply -f tekton/publish.yaml
     ```
   - [dashboard-build](https://github.com/tektoncd/dashboard/blob/main/tekton/build.yaml)
     ```shell script
     kubectl apply -f tekton/build.yaml
     ```
[comment]: <> (add link below after the file merges. As dashboard-report-bucket.yaml is not present tektoncd/dashboard, build tests throws error)
   - dashboard-report-bucket
     ```shell script
     kubectl apply -f tekton/report-bucket.yaml
     ```

   - [dashboard-release](https://github.com/tektoncd/dashboard/blob/main/tekton/release-pipeline.yaml)
     ```shell script
     kubectl apply -f tekton/release-pipeline.yaml
     ```

4. Select the commit you would like to build the release from, most likely the
   most recent commit at https://github.com/tektoncd/dashboard/commits/main
   and note the commit's hash.

5. Create environment variables for bash scripts in later steps.

    ```bash
    VERSION_TAG=# UPDATE THIS. Example: v0.19.2
    DASHBOARD_RELEASE_GIT_SHA=# SHA of the release to be released
    ```

6. Confirm commit SHA matches what you want to release.

    ```bash
    git show $DASHBOARD_RELEASE_GIT_SHA
    ```

7. Create a workspace template file:

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

8. Execute the release pipeline.

   **If you are back-porting include this flag: `--param=releaseAsLatest="false"`**

    ```bash
    tkn --context dogfooding pipeline start dashboard-release \
      --param=gitRevision="${DASHBOARD_RELEASE_GIT_SHA}" \
      --param=versionTag="${VERSION_TAG}" \
      --param=serviceAccountPath=release.json \
      --param=releaseBucket=gs://tekton-releases/dashboard \
      --workspace name=release-secret,secret=release-secret \
      --workspace name=workarea,volumeClaimTemplateFile=workspace-template.yaml
    ```

9. Watch logs of dashboard-release.

10. Once the pipeline run is complete, check its results:

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
    The two URLs can be opened in the browser or via `curl` to download the release manifests.

11. The YAMLs are now released! Anyone installing Tekton Dashboard will now get the new version. Time to create a new GitHub release announcement:

12. Create additional environment variables

    ```bash
    DASHBOARD_OLD_VERSION=# Example: v0.19.1
    TEKTON_PACKAGE=tektoncd/dashboard
    ```

13. Create a `PipelineResource` of type `git`

    ```shell
    cat <<EOF | kubectl --context dogfooding create -f -
    apiVersion: tekton.dev/v1alpha1
    kind: PipelineResource
    metadata:
      name: tekton-dashboard-$(echo $VERSION_TAG | tr '.' '-')
      namespace: default
    spec:
      type: git
      params:
        - name: url
          value: 'https://github.com/tektoncd/dashboard'
        - name: revision
          value: ${DASHBOARD_RELEASE_GIT_SHA}
    EOF
    ```

14. Execute the Draft Release task.

    ```bash
    tkn --context dogfooding task start \
      -i source="tekton-dashboard-$(echo $VERSION_TAG | tr '.' '-')" \
      -i release-bucket=tekton-dashboard-bucket \
      -p package=tektoncd/dashboard \
      -p release-tag="${VERSION_TAG}" \
      -p previous-release-tag="${DASHBOARD_OLD_VERSION}" \
      -p release-name="Tekton Dashboard" \
      create-draft-release
    ```

15. Watch logs of create-draft-release

16. On successful completion, a URL will be logged. Visit that URL and look through the release notes.
17. Manually add upgrade and deprecation notices based on the generated release notes
18. Double-check that the list of commits here matches your expectations
    for the release. You might need to remove incorrect commits or copy/paste commits
    from the release branch. Refer to previous releases to confirm the expected format.

19. Un-check the "This is a pre-release" checkbox since you're making a legit for-reals release!

20. Publish the GitHub release once all notes are correct and in order.

21. Edit `README.md` on `master` branch, add entry to docs table with latest release links.

22. Push & make PR for updated `README.md`

23. Test release that you just made against your own cluster (note `--context my-dev-cluster`):

     ```bash
     # Test latest
     kubectl --context my-dev-cluster apply --filename     https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.19.0/tekton-dashboard-release.yaml
     ```

24. Announce the release in Slack channels #general, #dashboard and #announcements.

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
