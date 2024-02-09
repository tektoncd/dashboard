# Tekton Dashboard E2E base image

## Create a release

To create a release:
- verify the `CHROME_VERSION` and `NODE_VERSION` args in the [`Dockerfile`](../Dockerfile) on the main branch are correct
- set a matching tag value in the `TAGS` environment variable in the [`CronJob`](./cronjob.yaml), e.g. `node20.11.0-chrome121`
- apply the `CronJob` to the default namespace on the dogfooding cluster (`kubectl apply -k .`)
- create a `Job` from the `CronJob` to trigger the release
  ```bash
  kubectl create job --from=cronjob/image-build-cron-trigger-dashboard-e2e-base dashboard-e2e-base-$(date +"%Y%m%d-%H%M")
  ```
- check the status of the [resulting `PipelineRun`](https://dashboard.dogfooding.tekton.dev/#/namespaces/default/pipelineruns?labelSelector=plumbing.tekton.dev%2Fimage%3Ddashboard-e2e-base)
- confirm the image was [released and properly tagged](https://console.cloud.google.com/gcr/images/tekton-releases/global/dogfooding/dashboard-e2e-base)
- open a PR to update the [E2E test `Dockerfile`](../../Dockerfile) to reference the new image

## Future: automated releases

We're currently leveraging the existing setup for nightly image releases documented at https://github.com/tektoncd/plumbing/tree/main/tekton/cronjobs

However, the `CronJob` is deliberately suspended (i.e. disabled) so that it does not run on a schedule. This is due to the fact that the image is expected to change infrequently, only to pick up new browser / Node.js releases as needed.

For now it must be triggered manually following the instructions above, but in future it will be automatically built and published on any change to its `Dockerfile`.
