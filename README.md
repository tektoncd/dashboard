# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Tekton Dashboard is a general purpose, web-based UI for Tekton Pipelines. It allows users to manage and view Tekton PipelineRuns and TaskRuns and the resources involved in their creation, execution, and completion. It also allows filtering of PipelineRuns and TaskRuns by label.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Pre-requisites

[Kubernetes](https://github.com/kubernetes/kubernetes) must be installed with version 1.15.0 or later if you want to use a version of Tekton Pipelines newer than v0.10.1.

[Tekton Pipelines](https://github.com/tektoncd/pipeline) must be installed in order to use the Tekton Dashboard. Instructions to install Tekton Pipelines can be found [here](https://github.com/tektoncd/pipeline/blob/master/docs/install.md). 

### Which version should I use?

- Use the v0.6.0 release for Tekton Pipelines v0.11.0 (can display components from Tekton Triggers 0.3.1 and has a read-only install mode)
- Use the v0.5.3 release for Tekton Pipelines v0.10.1 (can display components from Tekton Triggers 0.3.1 and has a read-only install mode)
- Use the v0.5.2 release for Tekton Pipelines v0.10.1 (can display components from Tekton Triggers 0.2.1 and has a read-only install mode)
- Use the v0.5.0 release for Tekton Pipelines v0.10.1 (can display components from Tekton Triggers 0.1 and has a read-only install mode)
- Use the v0.4.1 release for Tekton Pipelines v0.8.0 (can display components from Tekton Triggers 0.1)
- Use the v0.2.1 release for Tekton Pipelines v0.7.0
- Use the v0.1.1 release for Tekton Pipelines v0.5.2

## Install Dashboard

### Installing the latest release

1. Run the
   [`kubectl apply`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply)
   command to install the [Tekton Dashboard](https://github.com/tektoncd/dashboard)
   and its dependencies:

   ```bash
   kubectl apply --filename https://github.com/tektoncd/dashboard/releases/download/v0.6.0/tekton-dashboard-release.yaml
   ```

   Previous versions (up to 0.5.0) are available at `previous/$VERSION_NUMBER/release.yaml`, e.g.
   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.4.1/release.yaml

   As of version 0.5.0, the file name pattern is more descriptive, e.g.
   https://storage.googleapis.com/tekton-releases/dashboard/previous/v0.5.3/tekton-dashboard-release.yaml

2. Run the
   [`kubectl get`](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get)
   command to monitor the Tekton Dashboard component until all of the
   components show a `STATUS` of `Running`:

   ```bash
   kubectl get pods --namespace tekton-pipelines
   ```

   Tip: Instead of running the `kubectl get` command multiple times, you can
   append the `--watch` flag to view the component's status updates in real
   time. Use CTRL + C to exit watch mode.

Once the dashboard `STATUS` is `Running`, the dashboard can be accessed by following instructions in the [Accessing the Dashboard](#accessing-the-dashboard) section. 

Optionally, the dashboard can be used with the Tekton Webhooks Extension (see our [Getting Started](https://github.com/tektoncd/experimental/blob/master/webhooks-extension/docs/GettingStarted.md) guide).

### Installing a nightly build

Four nightly builds are available: (plain kube or Openshift) * (read-only or read-write):

To install your preferred flavour use one of these four commands:

```bash
kubectl apply -f https://storage.googleapis.com/tekton-releases-nightly/dashboard/latest/tekton-dashboard-release.yaml
kubectl apply -f https://storage.googleapis.com/tekton-releases-nightly/dashboard/latest/tekton-dashboard-release-readonly.yaml
kubectl apply -f https://storage.googleapis.com/tekton-releases-nightly/dashboard/latest/openshift-tekton-dashboard-release.yaml
kubectl apply -f https://storage.googleapis.com/tekton-releases-nightly/dashboard/latest/openshift-tekton-dashboard-release-readonly.yaml
```

### Installing from a development environment

As a developer you can install nightly builds, or a local build. Nightly builds come in the usual four flavours.

```shell
# Plain Kube
kustomize build overlays/latest | ko apply -f -
kustomize build overlays/latest-locked-down | ko apply -f -

# OpenShift
kustomize build overlays/latest-openshift --load_restrictor=LoadRestrictionsNone \
 | ko resolve -f - | kubectl apply -f - --validate=false
kustomize build overlays/latest-openshift-locked-down --load_restrictor=LoadRestrictionsNone \
 | ko resolve -f - | kubectl apply -f - --validate=false
```

In read-only mode, buttons and sections of the Dashboard will not be displayed (for example, you won't have the ability to create, stop, and delete PipelineRuns).

Development installation of the Dashboard uses `ko`:

```bash
$ docker login
$ export KO_DOCKER_REPO=docker.io/<mydockername>
$ ./install-dev.sh
```

The `install-dev.sh` script will build and push an image of the Tekton Dashboard to the Docker registry which you are logged into. Any Docker registry will do, but in this case it will push to Dockerhub. It will also apply the Pipeline0 definition and task: this allows you to import Tekton resources from Git repositories. It will also build the static web content using `npm` scripts.

### Optionally set up the Ingress endpoint

An Ingress definition is provided in the `ingress` directory, and this can optionally be installed and configured. If you wish to access the Tekton Dashboard, for example on your laptop that has a visible IP address, you can use the freely available [`nip.io`](https://nip.io/) service. A worked example follows.

Create the Ingress:

`kubectl apply ingress/basic-dashboard-ingress.yaml`

Retrieve a publicly available IP address (in this case running on a laptop connected to a public network):

`ip=$(ifconfig | grep netmask | sed -n 2p | cut -d ' ' -f2)`

Now modify the `host` property for our Ingress to use the IP obtained above, with the `tekton-dashboard` prefix and the `.nip.io` suffix:

`kubectl patch ing/tekton-dashboard -n tekton-pipelines --type=json -p='[{"op": "replace", "path": "/spec/rules/0/host", "value": '""tekton-dashboard.${ip}.nip.io""}]`

You can then access the Tekton Dashboard at `tekton-dashboard.${ip}.nip.io`. This endpoint is also returned via the "get Tekton Dashboard Ingress" [API](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md#api-definitions).

## Install on OpenShift

1. Install the Openshift Pipeline Operator from the operator hub.

2. Assuming you want to install the Dashboard into the `openshift-pipelines` namespace, which is the default one:

   ```bash
   kubectl apply --filename https://github.com/tektoncd/dashboard/releases/download/v0.6.0/openshift-tekton-dashboard-release.yaml --validate=false
   ```

3. Access the dashboard by determining its route with `kubectl get route tekton-dashboard -n openshift-pipelines`

### Enable TLS for dashboard access via Ingress
**Will only work in the cluster node**
#### Pre-requisites:
1. Tekton pipelines & dashboard installed
2. dashboard repo cloned

#### Steps:
1. Edit `ingress/ingress-https-setup.sh` with all the necessary info
2. Run the script from within the dashboard repo
3. Access dashboard via `https://tekton-dashboard.<IP_ADDRESS>.nip.io`


## Install on Minishift

Either follow the instructions for OpenShift above or use the operator install as per the instructions below.

1. Install [tektoncd-pipeline-operator](https://github.com/openshift/tektoncd-pipeline-operator#deploy-openshift-pipelines-operator-on-minikube-for-testing)
2. [Checkout](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md#checkout-your-fork) the repository

If you want to install the Dashboard into the tekton-pipelines namespace:

- Install the Dashboard `./minishift-install-dashboard.sh`

If you want to install the Dashboard into any other namespace:

- Install the Dashboard `./minishift-install-dashboard.sh -n {NAMESPACE}`

3. Wait until the pod `tekton-dashboard-1` is running in the namespace the Dashboard is installed into

## Accessing the Dashboard

The Dashboard can be accessed through its ClusterIP Service by running `kubectl proxy`. Assuming tekton-pipelines is the install namespace for the Dashboard, you can access the web UI at `localhost:8001/api/v1/namespaces/tekton-pipelines/services/tekton-dashboard:http/proxy/`.

An alternative way to access the Dashboard is using `kubectl port-forward` e.g. if you installed the Tekton Dashboard into the `tekton-pipelines` namespace (which is the default) you can access the Dashboard with `kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097` and then just open `localhost:9097`.

## Accessing the Dashboard on Minishift

The Dashboard can be accessed by running `kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097`
If installed into a namespace other than tekton-pipelines then the Dashboard can be accessed by running `kubectl --namespace $NAMESPACE port-forward svc/tekton-dashboard 9097:9097`
You can access the web UI at `http://localhost:9097/`

## Uninstalling the Dashboard on Minishift

The Dashboard can be uninstalled on Minishift by running the command `./minishift-delete-dashboard.sh` Use `-n {NAMESPACE}` on the end of the command if installed into a namespace other than `tekton-pipelines`

## Troubleshooting

Keep in mind that When running your Tekton Pipelines, if you see a `fatal: could not read Username for *GitHub repository*: No such device or address` message in your failing Task logs, this indicates there is no `tekton.dev/git` annotated GitHub secret in use by the ServiceAccount that launched this PipelineRun. It is advised to create one through the Tekton Dashboard. The annotation will be added and the specified ServiceAccount will be patched.

## Want to contribute

We are so excited to have you!

- See [CONTRIBUTING.md](https://github.com/tektoncd/pipeline/blob/master/CONTRIBUTING.md) for an overview of our processes
- See [DEVELOPMENT.md](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md) for how to get started
