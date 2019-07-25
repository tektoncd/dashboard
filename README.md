# Tekton Dashboard

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Tekton Dashboard is a general purpose, web-based UI for Tekton Pipelines. It allows users to manage and view Tekton Pipeline and Task runs and the resources involved in their creation, execution, and completion.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Pre-requisites

[Tekton Pipelines](https://github.com/tektoncd/pipeline) 0.5 or later must be installed in order to use the Tekton Dashboard. Instructions to install Tekton Pipelines can be found [here](https://github.com/tektoncd/pipeline/blob/master/docs/install.md).

## Install Dashboard

The Tekton Dashboard has a hosted image located at gcr.io/tekton-nightly/dashboard:latest
To install the latest dashboard using this image:

```bash
kubectl apply -f config/release/gcr-tekton-dashboard.yaml
```

Alternatively, the dashboard can be installed through the same GitHub release asset:

```bash
curl -L https://github.com/tektoncd/dashboard/releases/download/v0/gcr-tekton-dashboard.yaml | kubectl apply -f -
```

Development installation of the Dashboard uses `ko`:

```bash
sh
$ docker login
$ export KO_DOCKER_REPO=docker.io/<mydockername>
$ ./install-dev.sh
```

The `install-dev.sh` script will build and push an image of the Tekton Dashboard to the Docker registry which you are logged into. Any Docker registry will do, but in this case it will push to Dockerhub. It will also apply the Pipeline0 definition and task: this allows you to import Tekton resources from Git repositories. It will also build the static web content using `npm` scripts.

## Install on OpenShift

1. Assuming you want to install the Dashboard into the `tekton-pipelines` namespace:


```bash
curl -L https://github.com/tektoncd/dashboard/releases/download/v0/gcr-tekton-dashboard.yaml | kubectl apply -f -
```

2. Add a Route:

```
oc expose service tekton-dashboard \
  -n tekton-pipelines \
  --name "tekton-dashboard" \
  --port="http" \
  --hostname=tekton-dashboard.${openshift_master_default_subdomain}
```

`$openshift_master_default_subdomain` in this example is `mycluster.foo.com`. This gives you the following Route:

```
NAME               HOST/PORT                                PATH      SERVICES           PORT      TERMINATION   WILDCARD
tekton-dashboard   tekton-dashboard.mycluster.foo.com                 tekton-dashboard   http                    None
```

3. Access the dashboard at http://tekton-dashboard.mycluster.foo.com

This has been tested with the following OpenShift security settings (from `oc get scc`):

```
NAME               PRIV      CAPS      SELINUX     RUNASUSER          FSGROUP     SUPGROUP    PRIORITY   READONLYROOTFS   VOLUMES
anyuid             false     []        MustRunAs   RunAsAny           RunAsAny    RunAsAny    10         false            [configMap downwardAPI emptyDir persistentVolumeClaim projected secret]
hostaccess         false     []        MustRunAs   MustRunAsRange     MustRunAs   RunAsAny    <none>     false            [configMap downwardAPI emptyDir hostPath persistentVolumeClaim projected secret]
hostmount-anyuid   false     []        MustRunAs   RunAsAny           RunAsAny    RunAsAny    <none>     false            [configMap downwardAPI emptyDir hostPath nfs persistentVolumeClaim projected secret]
hostnetwork        false     []        MustRunAs   MustRunAsRange     MustRunAs   MustRunAs   <none>     false            [configMap downwardAPI emptyDir persistentVolumeClaim projected secret]
node-exporter      false     []        RunAsAny    RunAsAny           RunAsAny    RunAsAny    <none>     false            [*]
nonroot            false     []        MustRunAs   MustRunAsNonRoot   RunAsAny    RunAsAny    <none>     false            [configMap downwardAPI emptyDir persistentVolumeClaim projected secret]
privileged         true      [*]       RunAsAny    RunAsAny           RunAsAny    RunAsAny    <none>     false            [*]
restricted         false     []        MustRunAs   MustRunAsRange     MustRunAs   RunAsAny    <none>     false            [configMap downwardAPI emptyDir persistentVolumeClaim projected secret]
```

## Install on Minishift

1. Install [tektoncd-pipeline-operator](https://github.com/openshift/tektoncd-pipeline-operator#deploy-openshift-pipelines-operator-on-minikube-for-testing)
2. [Checkout](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md#checkout-your-fork) the repository

If you want to install the dashboard into the tekton-pipelines namespace:

- Install the Dashboard `./minishift-install-dashboard.sh`

If you want to install the dashboard into any other namespace:

- Install the Dashboard `./minishift-install-dashboard.sh -n {NAMESPACE}`

3. Wait until the pod `tekton-dashboard-1` is running in the namespace the Dashboard is installed into

## Accessing the Dashboard on Minishift

The Dashboard can be accessed by running `kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097`
If installed into a namespace other than tekton-pipelines then the dashboard can be accessed by running `kubectl --namespace $NAMESPACE port-forward svc/tekton-dashboard 9097:9097`
You can access the web UI at `http://localhost:9097/`

## Uninstalling the Dashboard on Minishift

The Dashboard can be uninstalled on Minishift by running the command `./minishift-delete-dashboard.sh` Use `-n {NAMESPACE}` on the end of the command if installed into a namespace other than `tekton-pipelines`

## Accessing the Dashboard

The Dashboard can be accessed through its ClusterIP Service by running `kubectl proxy`. Assuming tekton-pipelines is the install namespace for the dashboard, you can access the web UI at `localhost:8001/api/v1/namespaces/tekton-pipelines/services/tekton-dashboard:http/proxy/`. An alternative way to access the Dashboard is using `kubectl port-forward` e.g. if you installed the Tekton Dashboad into the `tekton-pipelines` namespace (which is the deafult) you can access the Dashboard with `kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097` and then just open `localhost:9097`.

## Want to contribute

We are so excited to have you!

- See [CONTRIBUTING.md](https://github.com/tektoncd/pipeline/blob/master/CONTRIBUTING.md) for an overview of our processes
- See [DEVELOPMENT.md](https://github.com/tektoncd/dashboard/blob/master/DEVELOPMENT.md) for how to get started
