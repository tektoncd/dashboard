# Tekton Dashboard E2E base image

## Create a release

To create a release:

- verify the `CHROME_VERSION` and `NODE_VERSION` args in the [`Dockerfile`](./Dockerfile) on the main branch are correct
- set a matching tag value for the `on.workflow_dispatch.inputs.tag.default` input in the [workflow](../../../.github/workflows/e2e-base-image.yml), e.g. `node20.11.0-chrome121`
- manually trigger the [workflow](https://github.com/tektoncd/dashboard/actions/workflows/e2e-base-image.yml)
- check the status of the resulting run
- confirm the image was [released and properly tagged](https://github.com/tektoncd/dashboard/pkgs/container/dashboard%2Fdashboard-e2e-base)
- open a PR to update the [E2E test `Dockerfile`](../Dockerfile) to reference the new image
