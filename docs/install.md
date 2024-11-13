<!--
---
linkTitle: "Install"
weight: 2
---
-->

# Installing Tekton Dashboard

This guide explains how to install Tekton Dashboard. It covers the following topics:

- [Before you begin](#before-you-begin)
- [Pre-requisites](#pre-requisites)
- [Installing Tekton Dashboard on Kubernetes](#installing-tekton-dashboard-on-kubernetes)
- [Installing with the installer script](#installing-with-the-installer-script)
- [Accessing the Dashboard](#accessing-the-dashboard)
- [Uninstalling the Dashboard on Kubernetes](#uninstalling-the-dashboard-on-kubernetes)
- [Next steps](#next-steps)

## Before you begin

Choose the version of Tekton Dashboard you want to install. You have the following options:

- **[Official](https://github.com/tektoncd/dashboard/releases)** - install this unless you have a specific reason to go for a different release.
- **[Nightly](https://ghcr.io/tektoncd/dashboard)** - may contain bugs, install at your own risk.
- **[`HEAD`]** - this is the bleeding edge. It contains unreleased code that may result in unpredictable behavior. To get started, see the [development guide](../DEVELOPMENT.md) instead of this page.

## Pre-requisites

In order to install the Tekton Dashboard, please make sure the following requirements are met:
- You must have a Kubernetes cluster running version 1.24.0 or later. Tekton Pipelines 
or other projects may require a newer version.

  If you don't already have a cluster, you can create one for testing with `kind`.
  [Install `kind`](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) and create a cluster by running [`kind create cluster`](https://kind.sigs.k8s.io/docs/user/quick-start/#creating-a-cluster). This
  will create a cluster running locally, with RBAC enabled and your user granted
  the `cluster-admin` role.

- Tekton Pipelines must be installed in the cluster. See [Installing Tekton Pipelines](https://github.com/tektoncd/pipeline/blob/main/docs/install.md).
- Optionally, install Tekton Triggers. See [Installing Tekton Triggers](https://github.com/tektoncd/triggers/blob/main/docs/install.md).

### Supported Tekton Pipelines and Tekton Triggers versions

Each Tekton Dashboard release is tested against specific Tekton Pipelines and Tekton Triggers versions. See the Tekton Dashboard release notes for details of the supported versions.

## Installing Tekton Dashboard on Kubernetes

To install Tekton Dashboard on a Kubernetes cluster:

1. Run the following command to install Tekton Dashboard:

   ```bash
   kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/release.yaml
   ```

   This will install the Dashboard in read-only mode by default.

   Previous versions are available at `previous/$VERSION_NUMBER/*.yaml`, e.g.
   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.32.0/release.yaml

   To install in read/write mode, use release-full.yaml.

   v0.31.0 and earlier used a different naming scheme for the release manifests:

   | Mode | Current | v0.31.0 and earlier |
   |------|---------|---------------------|
   | read-only | release.yaml | tekton-dashboard-release-readonly.yaml |
   | read/write | release-full.yaml | tekton-dashboard-release.yaml |

1. Monitor the installation using the following command until all components show a `Running` status:

   ```bash
   kubectl get pods --namespace tekton-pipelines --watch
   ```

   **Note:** Hit CTRL+C to stop monitoring.

Congratulations! You have successfully installed Tekton Dashboard on your Kubernetes cluster.

## Installing with the installer script

`v0.8.0` and later releases provide an installer script to simplify deploying the Tekton Dashboard with custom options.

You can refer to the dev docs for more info on [how to use the installer](./dev/installer.md).

For example:

- to install the latest release in read/write mode:

  ```bash
  curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/main/scripts/release-installer | \
    bash -s -- install latest --read-write
  ```

- to install with access to a subset of namespaces instead of full cluster access:

  ```bash
  curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/main/scripts/release-installer | \
    bash -s -- install latest --read-write --tenant-namespaces tenant-namespace1,tenant-namespace2
  ```

  This will add the `--namespaces` arg to the Dashboard deployment and create a RoleBinding in each of the specified namespaces with role `tekton-dashboard-tenant` granted to the Dashboard ServiceAccount.

- to install with support for loading logs from an external source:

  ```bash
  curl -sL https://raw.githubusercontent.com/tektoncd/dashboard/main/scripts/release-installer | \
    bash -s -- install latest --read-write --external-logs <logs-provider-url>
  ```

  See [Tekton Dashboard walk-through - Logs persistence](./walkthrough/walkthrough-logs.md) for details

## Accessing the Dashboard

By default, the Dashboard is not exposed outside the cluster.

There are several solutions described below for accessing the Dashboard UI depending on your setup.

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
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tekton-dashboard
  namespace: tekton-pipelines
spec:
  rules:
  - host: $DASHBOARD_URL
    http:
      paths:
      - pathType: ImplementationSpecific
        backend:
          service:
            name: tekton-dashboard
            port:
              number: 9097
EOF
```

You can now access the Dashboard UI at `http(s)://dashboard.domain.tld` in your browser (assuming the host configured in the ingress is `dashboard.domain.tld`)

Notes:
- The exact `Ingress` resource definition may vary a little depending on the ingress controller installed in the cluster. Some specific annotations may be required for the ingress controller to process the `Ingress` resource correctly
- If you don't have access to a domain you can use the freely available [`nip.io`](https://nip.io/) service

An example using the NGINX ingress controller to expose the Dashboard on a specific path instead of at the root of the domain:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tekton-dashboard
  namespace: tekton-pipelines
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: domain.tld
    http:
      paths:
      - path: /tekton(/|$)(.*)
        backend:
          service:
            name: tekton-dashboard
            port:
              number: 9097
```

You can then access the Dashboard UI at `http(s)://domain.tld/tekton/`

### Access control

The Dashboard does not provide its own authentication or authorization, however it will pass on any authentication headers provided to it by a proxy deployed in front of the Dashboard. These are then handled by the Kubernetes API server allowing for full access control via [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/). In case of forbidden access the Dashboard will display corresponding error notifications.

See the walk-throughs for an example of [enabling authentication using oauth2-proxy](./walkthrough/walkthrough-oauth2-proxy.md).

By default the Dashboard accesses resources and performs actions in the cluster using the permissions granted to its own ServiceAccount (i.e. the `tekton-dashboard` ServiceAccount in the `tekton-pipelines` namespace). If you wish to have the Dashboard perform actions on behalf of the authenticated user or some other ServiceAccount this can be achieved via [user impersonation](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#user-impersonation). This is known to work with a number of popular solutions including oauth2-proxy, Keycloak, OpenUnison, Traefik, Istio's EnvoyFilter, and more.

Typically when configuring impersonation you would have the proxy forward its ServiceAccount token in the `Authorization` header, and details of the user and groups in the `Impersonate-User` and `Impersonate-Group` headers respectively. See the docs of your chosen solution for details.

When using a reverse proxy, with impersonation headers or the user's account, you should remove the Dashboard's privileges to better maintain a "least privileged" approach.  This will make it less likely that the Dashboard's `ServiceAccount` will be abused:


```
kubectl delete clusterrolebinding -l rbac.dashboard.tekton.dev/subject=tekton-dashboard
kubectl delete rolebinding -l rbac.dashboard.tekton.dev/subject=tekton-dashboard -n tekton-pipelines
```

If you're using one of these proxies to provide authentication but still want to use the Dashboard's ServiceAccount to access the Kubernetes APIs you may need to modify the proxy config to prevent it from sending the `Authorization` header on upstream requests to the Dashboard. Some examples of relevant config:
- oauth2-proxy: add the `--pass-authorization-header=false` command line argument or its equivalent to your config https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/overview#command-line-options
- Istio EnvoyFilter: the external authentication service should return a custom header `x-envoy-auth-headers-to-remove: Authorization` https://www.envoyproxy.io/docs/envoy/latest/api-v3/service/auth/v3/external_auth.proto
- Traefik: `removeHeader: true` https://doc.traefik.io/traefik/v2.0/middlewares/basicauth/#removeheader

## Uninstalling the Dashboard on Kubernetes

The Dashboard can be uninstalled by running the following command:

```bash
kubectl delete --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/release.yaml
```

The above command assumes that the current latest version was installed, refer to [Installing Tekton Dashboard on Kubernetes](#installing-tekton-dashboard-on-kubernetes) to find the correct `--filename` argument if another version was installed.

## Next steps

To get started with Tekton Dashboard, see the [tutorial](./tutorial.md).

To add more functionality to your Tekton Dashboard, see the [Tekton Dashboard extensions](./extensions.md)

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
