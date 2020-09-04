# Installing Tekton Dashboard

This guide explains how to install Tekton Dashboard. It covers the following topics:

- [Before you begin](#before-you-begin)
- [Pre-requisites](#pre-requisites)
- [Which version should I use](#which-version-should-i-use)
- [Installing with the installer script](#installing-with-the-installer-script)
- [Installing Tekton Dashboard on Kubernetes](#installing-tekton-dashboard-on-kubernetes)
- [Installing Tekton Dashboard on OpenShift](#installing-tekton-dashboard-on-openshift)
- [Accessing the Dashboard](#accessing-the-dashboard)
- [Uninstalling the Dashboard on Kubernetes](#uninstalling-the-dashboard-on-kubernetes)
- [Next steps](#next-steps)

## Before you begin

Choose the version of Tekton Dashboard you want to install. You have the following options:

- **[Official](https://github.com/tektoncd/dashboard/releases)** - install this unless you have a specific reason to go for a different release.
- **[Nightly](../tekton/README.md#nightly-releases)** - may contain bugs, install at your own risk. Nightlies live at `gcr.io/tekton-nightly`.
- **[`HEAD`]** - this is the bleeding edge. It contains unreleased code that may result in unpredictable behavior. To get started, see the [development guide](../DEVELOPMENT.md) instead of this page.

## Pre-requisites

In order to install the Tekton Dashboard, please make sure the following requirements are met:
- A [kubernetes cluster](https://github.com/kubernetes/kubernetes) must be installed with version 1.15.0 or later.
- [Tekton Pipelines](https://github.com/tektoncd/pipeline) must be installed in the cluster.
See [Installing Tekton Pipelines](https://github.com/tektoncd/pipeline/blob/master/docs/install.md) to install Tekton Pipelines in your cluster.
- Optionally, install [Tekton Triggers](https://github.com/tektoncd/triggers).
See [Installing Tekton Triggers](https://github.com/tektoncd/triggers/blob/master/docs/install.md) to install Tekton Triggers in your cluster.

## Which version should I use

Every Tekton Dashboard version is meant to support specific Tekton Pipelines and Tekton Triggers versions.
See the [docs on the main page](../README.md) to find the Tekton Dashboard version that suits your needs.

Please, pay attention to annoucements like **deprecated versions** and/or **security related recommendations** when choosing the version you want to install.

## Installing with the installer script

We recently introduced an installer script to make it easy to deploy the Tekton Dashboard with custom options.

While this is still an experimental feature, it should help making the install process customizable and allow you to provide options that suit your needs. We would definitely love to hear your feedback on this new install mode.

You can refer to the dev docs for more infos [on how to use the installer](./dev/installer.md).

**Important note:** this won't work with releases prior to `v0.8.0`, the installer needs specific assets to work and those assets weren't produced in past release thus making the installer impossible to use with versions before `v0.8.0`.

In a nutshell, invoking the `installer` will look something like this:

```bash
curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/master/scripts/release-installer | \
   bash -s -- install latest --read-only
```

Of course, you can still use the generated manifests as detailed below.

**NOTE:** To install a specific version, specify it right after the `install` command:

```bash
curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/master/scripts/release-installer | \
   bash -s -- install v0.8.2 --read-only
```

## Installing Tekton Dashboard on Kubernetes

To install Tekton Dashboard on a Kubernetes cluster:

1. Run the following command to install Tekton Dashboard and its dependencies:

   ```bash
   kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/tekton-dashboard-release.yaml
   ```

   Previous versions (up to 0.5.0) are available at `previous/$VERSION_NUMBER/release.yaml`, e.g.
   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.4.1/release.yaml

   Note that versions earlier than **v0.6.1.4** should not be used owing to security problems we have addressed in that release and later.

   ```bash
    kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.4.1/release.yaml
   ```

   As of version 0.5.0, the file name pattern is more descriptive, e.g.
   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.6.0/tekton-dashboard-release.yaml

   ```bash
    kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.6.0/tekton-dashboard-release.yaml
   ```

1. Monitor the installation using the following command until all components show a `Running` status:

   ```bash
   kubectl get pods --namespace tekton-pipelines --watch
   ```

   **Note:** Hit CTRL+C to stop monitoring.

Congratulations! You have successfully installed Tekton Dashboard on your Kubernetes cluster.

## Installing Tekton Dashboard on OpenShift

To install Tekton Dashboard on an OpenShift cluster:

1. Install the Openshift Pipeline Operator from the operator hub.

1. Assuming you want to install the Dashboard into the `openshift-pipelines` namespace, which is the default one:

   ```bash
   kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/openshift-tekton-dashboard-release.yaml --validate=false
   ```

Congratulations! You have successfully installed Tekton Dashboard on your OpenShift cluster.

**Note for users installing Tekton Pipelines and Triggers outside the OpenShift Pipelines operator:**

Tekton Dashboard on OpenShift works out of the box with the OpenShift Pipelines operator. If you installed Tekton Pipelines and Triggers without using the OpenShift Pipelines operator, you will need to change the following args `--pipelines-namespace=openshift-pipelines` and `--triggers-namespace=openshift-pipelines` and set their values to the namespace where Pipelines and Triggers were respectively deployed.

## Accessing the Dashboard

By default, the Dashboard is not exposed outside the cluster.

There are several solutions to access the Dashboard UI depending on your setup described below.

### Using kubectl proxy

The Dashboard can be accessed through its ClusterIP Service by running `kubectl proxy`.

Assuming `tekton-pipelines` is the install namespace for the Dashboard, run the following command:

```bash
kubectl proxy
```

Browse http://localhost:8001/api/v1/namespaces/tekton-pipelines/services/tekton-dashboard:http/proxy/ to access your Dashboard.

### Using kubectl port-forward

An alternative way to access the Dashboard is using `kubectl port-forward`.

Assuming `tekton-pipelines` is the install namespace for the Dashboard, run the following command:

```bash
kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097
```

Browse http://localhost:9097 to access your Dashboard.

### Using an Ingress rule

A more advanced solution is to expose the Dashboard through an `Ingress` rule.

This way the Dashboard can be accessed as a regular website without requiring `kubectl`.

Assuming you have an [ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) up and running in your cluster, and that `tekton-pipelines` is the install namespace for the Dashboard, run the following command to create the `Ingress` resource:

```bash
# replace DASHBOARD_URL with the hostname you want for your dashboard
# the hostname should be setup to point to your ingress controller
DASHBOARD_URL=dashboard.domain.tld
kubectl apply -n tekton-pipelines -f - <<EOF
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: tekton-dashboard
  namespace: tekton-pipelines
spec:
  rules:
  - host: $DASHBOARD_URL
    http:
      paths:
      - backend:
          serviceName: tekton-dashboard
          servicePort: 9097
EOF
```

You should be able to access the Dashboard UI at `http(s)://dashboard.domain.tld` in your browser (assuming the host configured in the ingress is `dashboard.domain.tld`)

Notes:
- The exact `Ingress` resource definition may vary a little depending on the ingress controller installed in the cluster. Some specific annotations may be required for the ingress controller to process the `Ingress` resource correctly
- If you don't have access to a domain you can use the freely available [`nip.io`](https://nip.io/) service

## Uninstalling the Dashboard on Kubernetes

The Dashboard can be uninstalled by running the following command:

```bash
kubectl delete --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/tekton-dashboard-release.yaml
```

The above command assumes that the latest version was installed, refer to [Installing Tekton Dashboard on Kubernetes](#installing-tekton-dashboard-on-kubernetes) to find the correct `--filename` argument if another version was installed.

## Next steps

To get started with Tekton Dashboard, see the [Tekton Dashboard katacoda tutorial](https://katacoda.com/tektoncd/scenarios/tekton-dashboard).

To add more functionality to your Tekton Dashboard, see the [Tekton Dashboard extensions](./extensions.md)

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
