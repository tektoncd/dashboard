# Tekton Dashboard - Installer

This guide explains how to use the installer to build, install or uninstall the Dashboard using the [installer script](../../scripts/installer).

It covers the following topics:

- [Before you begin](#before-you-begin)
- [Help command](#help-command)
- [Install command](#install-command)
  - [Installing on Kubernetes](#installing-on-kubernetes)
  - [OpenShift with Tekton Pipelines and Triggers installed by OpenShift Pipelines Operator](#openshift-with-tekton-pipelines-and-triggers-installed-by-openshift-pipelines-operator)
  - [Installing in a custom namespace](#installing-in-a-custom-namespace)
  - [Read/write install](#read-write-install)
  - [Installing for single namespace visibility](#installing-for-single-namespace-visibility)
  - [Install ingress](#install-ingress)
- [Uninstall command](#uninstall-command)
- [Build command](#build-command)
- [Platform support](#platform-support)

## Before you begin

The `installer` script makes it easy to install the Tekton Dashboard by allowing command line options to customize the manifests at install time.

For example, this allows the `installer` script to ensure that the deployed Dashboard and the RBAC permissions are consistent.

**Notes:**
- These instructions don't cover the frontend, make sure you [build the frontend](./README.md#build-the-frontend) first.
- The `installer` script uses `ko`. Before it can build and push the dashboard docker image you will have to define the `KO_DOCKER_REPO` environment variable.

  You can use a remote repository like [Docker Hub](https://hub.docker.com/) or set it to `ko.local` to avoid dealing with auth / network issues for an external repository. See [ko usage](https://github.com/google/ko#usage) for more info.

  ```bash
  export KO_DOCKER_REPO='ko.local'
  # or use an external repository
  # export KO_DOCKER_REPO='docker.io/myusername'
  ```

## Help command

The `help` command shows the supported commands and options by the script:

```bash
./scripts/installer help
```

It will produce output similar to the following:

```bash
Global command syntax:
        installer COMMAND [OPTIONS]

Accepted commands:
        help|h                                  Prints this help
        install|i                               Installs the dashboard
        uninstall|u                             Uninstalls the dashboard
        build|b                                 Builds the manifests and dashboard docker image

Accepted options:
        [--debug]                               Prints additional messages in the console
        [--extensions-rbac]                     Enable ClusterRole aggregation for easier management of extensions RBAC
        [--external-logs <logs-provider-url>]   External URL from which to fetch logs when logs are not available in the cluster
        [--ingress-secret <secret>]             Will add SSL support to the ingress
        [--ingress-url <url>]                   Will create an additional ingress with the specified URL
        [--log-format <log-format>]             Specifies the log format (json or console), default is json
        [--log-level <log-level>]               Specifies the log level (debug, info, warn, error, dpanic, panic, fatal), default is info
        [--logout-url <logout-url>]             Will set up the logout URL
        [--namespace <namespace>]               Will override install namespace
        [--nightly]                             Will download manifests from the nightly releases channel
        [--output <file>]                       Will output built manifests in the file instead of in the console
        [--pipelines-namespace <namespace>]     Override the namespace where Tekton Pipelines is installed (defaults to Dashboard install namespace)
        [--platform <platform>]                 Override the platform to build for
        [--read-write]                          Will build manifests for a read/write deployment
        [--stream-logs false]                   Will disable log streaming and use polling instead
        [--tag <tag>]                           Tag used for the image produced by ko
        [--tenant-namespaces <namespaces>]      Will limit the visibility to the specified comma-separated namespaces only
        [--triggers-namespace <namespace>]      Override the namespace where Tekton Triggers is installed (defaults to Dashboard install namespace)
        [--version <version>]                   Will download manifests for specified version or build everything using kustomize/ko
```

## Install command

The `install` command is used to install the Tekton Dashboard in a cluster. It supports both Kubernetes and OpenShift.

Examples below illustrate the main `install` options:
- [Installing on Kubernetes](#installing-on-kubernetes)
- [OpenShift with Tekton Pipelines and Triggers installed by OpenShift Pipelines Operator](#openshift-with-tekton-pipelines-and-triggers-installed-by-openshift-pipelines-operator)
- [Installing in a custom namespace](#installing-in-a-custom-namespace)
- [Installing for single namespace visibility](#installing-for-single-namespace-visibility)
- [Install ingress](#install-ingress)

### Installing on Kubernetes

To install the Tekton Dashboard on Kubernetes, using the default options, run the command:

```bash
./scripts/installer install
```

This will install the Dashboard in the `tekton-pipelines` namespace and assumes that Tekton Pipelines and Triggers are also installed in the `tekton-pipelines` namespace.

### OpenShift with Tekton Pipelines and Triggers installed by OpenShift Pipelines Operator

To install the Tekton Dashboard on OpenShift after installing Tekton Pipelines and Triggers using OpenShift Pipelines Operator, run the command:

```bash
./scripts/installer install --namespace openshift-pipelines
```

Alternatively, take one of the official release manifests and replace any reference to the `tekton-pipelines` namespace with `openshift-pipelines` for the same result.

### Installing in a custom namespace

You can install the Dashboard in the namespace of your choice, this works whatever the platform (Kubernetes / OpenShift) and install method (OpenShift Pipelines Operator / manifests).

To tell the `installer` script the target namespace of your choice, add the `--namespace` option:

```bash
CUSTOM_NAMESPACE=my-namespace

./scripts/installer install --namespace $CUSTOM_NAMESPACE
```

### Read/write install

To install the Dashboard add the `--read-write` option when calling the `installer` script:

```bash
./scripts/installer install --read-write
```

### Installing for limited namespace visibility

Limited namespace visibility restricts the Tekton Dashboard actions scope and resources that can be seen to a subset of namespaces in the cluster.

To install for limited namespace visibility run the following command:

```bash
TENANT_NAMESPACES=my-namespace1,my-namespace2

./scripts/installer install --tenant-namespaces $TENANT_NAMESPACES
```

### Install ingress

The `installer` script can create an ingress for your Dashboard service, to enable ingress creation add `--ingress-url` and optionally `--ingress-secret` if the ingress needs TLS support.

```bash
./scripts/installer install --ingress-url my-dashboard.my-domain.com --ingress-secret my-tls-certificate
```

## Uninstall command

To uninstall the Dashboard, use the `uninstall` instead of the `install` command.

```bash
./scripts/installer uninstall
```

## Build command

The `installer` script can be used to build the Dashboard docker image and the YAML manifests (taking care of command line options) by using the `build` command when calling the script:

```bash
./scripts/installer build
```

This will NOT deploy the resulting manifest in the target cluster but will build and push the Dashboard docker image to [whichever docker repo was configured](./README.md#build-and-deploy-with-kustomize-and-ko) for `ko` to work with and will display the YAML manifests in the console output.

The `build` command is useful when you want to ensure everything builds correctly without altering the current deployment. It can help verifying the generated manifests are correct when a change was made in the base or overlays used by `kustomize` too.

## Platform support

Official Dashboard releases provide multi-platform images supporting the following:
- `linux/amd64`
- `linux/arm64`
- `linux/ppc64le`
- `linux/s390x`

The `installer` script's `build` and `install` commands will build an image for `linux/amd64` by default.
To override the platform in cases where the target cluster is running on a different architecture, add `--platform <platform>` where `<platform>` is a value from the list of supported values, for example:
```bash
./scripts/installer install --platform linux/arm64
```
or build a multi-platform image by specifying `all` or a comma-separated list of supported platforms:
```bash
./scripts/installer install --platform all
```

This behaviour can also be controlled using the `GOOS` and `GOARCH` environment variables. 
See the [`ko` documentation](https://github.com/google/ko#multi-platform-images) for further details.

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
