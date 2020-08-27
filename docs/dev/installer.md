# Tekton Dashboard - Installer

This guide explains how to use the installer to build, install or uninstall the Dashboard using the [installer script](../../scripts/installer).

It covers the following topics:

- [Before you begin](#before-you-begin)
- [Help command](#help-command)
- [Install command](#install-command)
  - [Installing on Kubernetes](#installing-on-kubernetes)
  - [OpenShift with Tekton Pipelines and Triggers installed by OpenShift Pipelines Operator](#openshift-with-tekton-pipelines-and-triggers-installed-by-openshift-pipelines-operator)
  - [OpenShift with Tekton Pipelines and Triggers installed manually using YAML manifests](#openshift-with-tekton-pipelines-and-triggers-installed-manually-using-yaml-manifests)
  - [OpenShift image stream](#openshift-image-stream)
  - [Read only install](#read-only-install)
  - [Installing in a custom namespace](#installing-in-a-custom-namespace)
  - [Installing for single namespace visibility](#installing-for-single-namespace-visibility)
  - [Install ingress](#install-ingress)
- [Uninstall command](#uninstall-command)
- [Build command](#build-command)

## Before you begin

Installing the Dashboard is not always easy, especially when the setup involves custom namespaces or a different installation process.

The `installer` makes it easy to install the Tekton Dashboard by allowing command line options to customize the manifests at install time.

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
- **Important:** the `--csrf-secure-cookie` flag must not be set if you intend to access the Dashboard pod through port-forward or other insecure connection via `http` as any mutating API requests will be blocked. For production use (for example, when using a Route, or Ingress, which is secured with TLS) it should be set to enable the Secure attribute on the CSRF cookie.

## Help command

The `help` command shows the supported commands and options by the script:

```bash
./scripts/installer help
```

It should output the following message:

```bash
Global command syntax:
        installer COMMAND [OPTIONS]

Accepted commands:
        help|h                                  Prints this help
        install|i                               Installs the dashboard
        uninstall|u                             Uninstalls the dashboard
        build|b                                 Builds the manifests and dashboard docker image
        release|r                               Builds the manifests and dashboard docker image for release

Accepted options:
        [--debug]                               Prints additional messages in the console
        [--log-format <log-format>]             Specifies the log format (json or console), default is json
        [--log-level <log-level>]               Specifies the log level (debug, info, warn, error, dpanic, panic, fatal), default is info
        [--version <version>]                   Will download manifests for specified version or build everything using kustomize/ko
        [--nightly]                             Will download manifests from the nightly releases channel
        [--csrf-secure-cookie]                  Enable secure CSRF cookie
        [--openshift]                           Will build manifests for openshift
        [--image-stream]                        Will generate manifests using openshift image stream
        [--read-only]                           Will build manifests for a readonly deployment
        [--logout-url <logout-url>]             Will set up the logout URL
        [--namespace <namespace>]               Will override install namespace
        [--pipelines-namespace <namespace>]     Override the namespace where Tekton Pipelines is installed (defaults to tekton-pipelines)
        [--triggers-namespace <namespace>]      Override the namespace where Tekton Triggers is installed (defaults to tekton-pipelines)
        [--tenant-namespace <namespace>]        Will limit the visibility to the specified namespace only
        [--ingress-url <url>]                   Will create an additional ingress with the specified url
        [--ingress-secret <secret>]             Will add ssl support to the ingress
        [--stream-logs]                         Will enable log streaming instead of polling
        [--external-logs <logs-provider-url>]   External url to fetch logs from when not available in the cluster
        [--output <file>]                       Will output built manifests in the file instead of in the console
```

## Install command

The `install` command is used to install the Tekton Dashboard in a cluster. It supports both Kubernetes and OpenShift.

Note that OpenShift supports two install methods:
- Tekton Pipelines and Triggers installed by openshift pipelines operator
- Tekton Pipelines and Triggers installed manually using YAML manifests

Examples below illustrate the main `install` options:
- [Installing on Kubernetes](#installing-on-kubernetes)
- [OpenShift with Tekton Pipelines and Triggers installed by OpenShift Pipelines Operator](#openshift-with-tekton-pipelines-and-triggers-installed-by-openshift-pipelines-operator)
- [OpenShift with Tekton Pipelines and Triggers installed manually using YAML manifests](#openshift-with-tekton-pipelines-and-triggers-installed-manually-using-yaml-manifests)
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
./scripts/installer install --openshift
```

### OpenShift with Tekton Pipelines and Triggers installed manually using YAML manifests

To install the Tekton Dashboard on OpenShift after installing Tekton Pipelines and Triggers manually using YAML manifests, you will need to override Tekton Pipelines and Triggers install namespaces.

When installing from the manifests, Tekton Pipelines and Triggeers will be deployed in the `tekton-pipelines` namespace, whereas OpenShift Pipelines Operator uses the `openshift-pipelines` namespace.

Therefore, you will need to add the `--pipelines-namespace tekton-pipelines` and `--triggers-namespace tekton-pipelines` options when calling the installer script:

```bash
./scripts/installer install --openshift --pipelines-namespace tekton-pipelines --triggers-namespace tekton-pipelines
```

### OpenShift image stream

To install the Tekton Dashboard on OpenShift with image stream support, add the `--image-stream` option:

```bash
# for openshift / openshift pipelines operator
./scripts/installer install --openshift --image-stream

# for openshift / manifests
./scripts/installer install --openshift --image-stream --pipelines-namespace tekton-pipelines --triggers-namespace tekton-pipelines
```

### Read only install

To install the Dashboard add the `--read-only` option when calling the `installer` script:

```bash
# for kubernetes
./scripts/installer install --read-only

# for openshift / openshift pipelines operator
./scripts/installer install --openshift --read-only

# for openshift / manifests
./scripts/installer install --openshift --read-only --pipelines-namespace tekton-pipelines --triggers-namespace tekton-pipelines
```

### Installing in a custom namespace

You can install the Dashboard in the namespace of your choice, this works whatever the platform (Kubernetes / OpenShift) and install method (OpenShift Pipelines Operator / manifests).

To tell the `installer` script the target namespace of your choice, add the `--namespace` option:

```bash
CUSTOM_NAMESPACE=my-namespace

# for kubernetes
./scripts/installer install --namespace $CUSTOM_NAMESPACE

# for openshift / openshift pipelines operator
./scripts/installer install --openshift --namespace $CUSTOM_NAMESPACE

# for openshift / manifests
./scripts/installer install --openshift --pipelines-namespace tekton-pipelines --triggers-namespace tekton-pipelines --namespace $CUSTOM_NAMESPACE
```

### Installing for single namespace visibility

Single namespace visibility restricts the Tekton Dashboard actions scope and resources that can be seen to a single namespace in the cluster.

To install for single namespace visibility run the following command:

```bash
TENANT_NAMESPACE=my-namespace

# for kubernetes
./scripts/installer install --tenant-namespace $TENANT_NAMESPACE

# for openshift / openshift pipelines operator
./scripts/installer install --openshift --tenant-namespace $TENANT_NAMESPACE

# for openshift / manifests
./scripts/installer install --openshift --pipelines-namespace tekton-pipelines --triggers-namespace tekton-pipelines --tenant-namespace $TENANT_NAMESPACE
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
# for kubernetes
./scripts/installer build

# for openshift / openshift pipelines operator
./scripts/installer build --openshift

# for openshift / manifests
./scripts/installer build --openshift --pipelines-namespace tekton-pipelines --triggers-namespace tekton-pipelines
```

This will NOT deploy the resulting manifest in the target cluster but will build and push the Dashboard docker image to [whichever docker repo was configured](./README.md#build-and-deploy-with-kustomize-and-ko) for `ko` to work with and will display the YAML manifests in the console output.

The `build` command is useful when you want to ensure everything builds correctly without altering the current deployment. It can help verifying the generated manifests are correct when a change was made in the base or overlays used by `kustomize` too.

## Release command

This command is essentially the same as the [build command](#build-command) but adds the `--preserve-import-paths` option when invoking `ko`.

This is needed to generate the correct docker image name in the manifests when cutting a release.

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
