# Tekton Dashboard CI/CD

This directory contains the Tekton `Tasks` and `Pipelines` used to create Dashboard releases.

These tasks run on your local cluster, and then copy the release artifacts - docker images and yaml files - into [the `tekton releases` bucket in Google Cloud Platform](https://console.cloud.google.com/storage/browser/tekton-releases/dashboard). Your cluster must contain keys from a Google account with the necessary authorization in order for this to work.

## Create an official release

To create an official release, follow the steps in the [release-cheat-sheet](./release-cheat-sheet.md)

--- 

## Setup full release pipleline (for clusters other than Tektocd dofooding clusters)

To setup release setup from scratch and run a release on a clusters other than TektonCD dogfodding cluster, follow [release-full-setup.md](./release-full-setup.md)
