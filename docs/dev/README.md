# Tekton Dashboard - Dev docs

This guide explains how to build, deploy and test the Tekton Dashboard. It covers the following topics:

- [Pre-requisites](#pre-requisites)
- [Checkout your fork](#checkout-your-fork)
- [Build the frontend](#build-the-frontend)
- [Build the backend](#build-the-backend)
  - [Command line arguments](#command-line-arguments)
- [Build and deploy with the installer script](#build-and-deploy-with-the-installer-script)
- [Development server](#development-server)
- [Quick setup for local cluster](#quick-setup-for-local-cluster)
- [Run backend tests](#run-backend-tests)
  - [Backend unit tests](#backend-unit-tests)
  - [Integration tests](#integration-tests)
- [Run frontend tests](#run-frontend-tests)
  - [Frontend unit tests](#frontend-unit-tests)
  - [Linter](#linter)
- [i18n](#i18n)
- [Storybook](#storybook)
- [Troubleshooting](#troubleshooting)
- [Next steps](#next-steps)

## Pre-requisites

In order to run the Tekton Dashboard, please make sure the requirements in [the install doc](../install.md) are met.

You will also need the following tools in order to build the Dashboard locally and deploy it:
1. [`go`](https://golang.org/doc/install): The language the Tekton Dashboard backend is built in
1. [`git`](https://help.github.com/articles/set-up-git/): For source control
1. [Node.js & npm](https://nodejs.org/): For building and running the frontend locally. See `engines` in [package.json](../../package.json) for versions used. _Node.js 14.x is recommended_
1. [`ko`](https://github.com/google/ko): For development. `ko` version v0.7.2 or higher is required for `dashboard` to work correctly
1. [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/): For interacting with your kube cluster
1. [`kustomize`](https://kubernetes-sigs.github.io/kustomize/installation/): For building the Dashboard manifests. You need a recent version - v3.5.4 is recommended
See [here](https://github.com/kubernetes-sigs/kustomize/blob/master/docs/INSTALL.md#try-go) - `GO111MODULE=on go install sigs.k8s.io/kustomize/kustomize/v3` works correctly

## Checkout your fork

To check out this repository:

1. Create your own [fork of this repo](https://help.github.com/articles/fork-a-repo/)
1. Clone it to your machine:

```bash
git clone git@github.com:${YOUR_GITHUB_USERNAME}/dashboard.git
cd dashboard
git remote add upstream git@github.com:tektoncd/dashboard.git
git remote set-url --push upstream no_push
```

_Adding the `upstream` remote sets you up nicely for regularly
[syncing your fork](https://help.github.com/articles/syncing-a-fork/)._

**Note:** If using Windows and you initially cloned your repo before this PR was merged: https://github.com/tektoncd/dashboard/pull/1707, you may need to clear your git cache to avoid line-ending problems when building the frontend.

```
git rm --cached -r .
git reset --hard
```

## Build the frontend

First install and build the npm project.
Install with a clean slate of dependencies, if a node_modules folder is already present in the project root it will be automatically removed before install.

```bash
npm ci 
```

There is a dedicated npm job for ko builds:

```bash
npm run build_ko
```

This will build the static resources and add them to the `kodata` directory.

## Build the backend

The backend uses `go modules` to manage its dependencies. To build the go backend, run:

```bash
go build ./cmd/dashboard
```

This generates a binary named `dashboard` which you can run on your local computer by invoking it with the `--kube-config` flag:

```bash
./dashboard --kube-config $HOME/.kube/config
```

### Command line arguments

The dashboard backend supports a number of options through command line arguments.

These options are documented below:

| Argument | Description | Type | Default value |
|---|---|---|---|
| `--help` | Print help message and exit | `bool` | `false` |
| `--kube-config` | Path to kube config file, uses in cluster config if empty | `string` | `""` |
| `--pipelines-namespace` | Namespace where Tekton pipelines is installed (assumes same namespace as dashboard if not set) | `string` | `""` |
| `--triggers-namespace` | Namespace where Tekton triggers is installed (assumes same namespace as dashboard if not set) | `string` | `""` |
| `--port` | Dashboard port number | `int` | `8080` |
| `--read-only` | Enable or disable read only mode | `bool` | `false` |
| `--logout-url` | If set, enables logout on the frontend and binds the logout button to this url | `string` | `""` |
| `--namespace` | If set, limits the scope of resources watched to this namespace only | `string` | `""` |
| `--log-level` | Minimum log level output by the logger | `string` | `"info"` |
| `--log-format` | Format for log output (json or console) | `string` | `"json"` |

Run `dashboard --help` to show the supported command line arguments and their default values directly from the `dashboard` binary.

**Important note:** using `--namespace` ensures that the dashboard is watching resources in the namespace specified (and drives the frontend).
It doesn't limit actions that can be performed to this namespace only though. It's important that this flag is used **and** that RBAC rules are setup accordingly.

## Build and deploy with the installer script

To build and deploy the Dashboard backend easily, you can use the [installer script](./installer.md).

The installer script supports both Kubernetes and OpenShift, and it can adapt the YAML manifests for OpenShift Pipelines Operator or raw manifests install modes.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:8000/` in your browser. The app will automatically hot-reload any changes to the source files, including CSS. If it is unable to hot-reload it will fallback to a full page refresh.

Make sure that the backend service running in the cluster is proxied using `kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097`.

**Note:** If you've exposed the backend by some other means than port-forwarding port 9097 as described above, set the `API_DOMAIN` environment variable to provide the correct details.

e.g. to connect your local dev frontend to the Dashboard deployed on the robocat cluster:
`API_DOMAIN=https://dashboard.robocat.tekton.dev/ npm start`

**Note:** If modifying any of the sub-packages (e.g. components or utils in https://github.com/tektoncd/dashboard/tree/main/packages), you'll need to run `npm run bootstrap` to ensure those packages are correctly built and linked before starting the dev server or running a build. This is done automatically by `npm ci` or `npm install` so you may not have to run it directly depending on your workflow.

## Quick setup for local cluster

The Dashboard repository contains a script that will provision a [`kind` cluster](https://kind.sigs.k8s.io/) named 'tekton-dashboard' with the latest releases of Tekton Pipelines and Tekton Triggers installed, as well as a version of the Tekton Dashboard which can be customised by providing additional parameters matching those expected by the installer script described earlier.

For example, the following will create a cluster with a local build of the Tekton Dashboard with log streaming enabled, exposed via ingress at `tekton-dashboard.127.0.0.1.nip.io`:

`./scripts/prepare-kind-cluster create`

To delete the cluster:

`./script/prepare-kind-cluster delete`

## Run backend tests

### Backend unit tests

To run unit tests:

```bash
CGO_ENABLED=0 NAMESPACE=default go test -v ./...
```

To run unit tests with `-race`:

```bash
# CGO_ENABLED=1 is needed for -race on go test
CGO_ENABLED=1 NAMESPACE=default go test -race -v ./...
```

### Integration tests

To run integration tests you will need additonal tools:
1. [`kind`](https://kind.sigs.k8s.io/): For creating a local cluster running on top of docker.
1. [`helm`](https://helm.sh/docs/intro/install/): For installing helm charts in your kubernetes cluster.

Integration tests are located in the [/test/e2e-tests.sh](../../test/e2e-tests.sh) script.

To run the integration tests locally, you can use the [/test/local-e2e-tests.sh](../../test/local-e2e-tests.sh) script. It will create a fresh `kind` cluster, deploy a docker registry in it, run the integration tests script, and drop the test cluster automatically.

```bash
export KO_DOCKER_REPO='ko.local'
# or use an external repository
# export KO_DOCKER_REPO='docker.io/myusername'

./test/local-e2e-tests.sh
```

**Note:** You can override the Tekton Pipelines and/or Triggers versions deployed in the test cluster by providing `PIPELINES_VERSION` and/or `TRIGGERS_VERSION` environment variables.

## Run frontend tests

### Frontend unit tests

Run `npm test` to execute the unit tests via [Jest](https://jestjs.io/) in interactive watch mode. This also generates a code coverage report by default.

Coverage threshold is set to 90%, if it falls below the threshold the test script will fail.

Tests are defined in `*.test.js` files alongside the code under test.

### Linter

Run `npm run lint` to execute the linter (eslint + prettier). This will ensure code follows the conventions and standards used by the project.

Run `npm run lint:fix` to automatically fix a number of types of problem including code style.

## i18n

This project uses `react-intl` for internationalization, and provides a script to automatically extract messages to bundles for translation. Run `npm run i18n:extract` from the root of the project to update the message bundles which can be found in `src/nls/`.

**Note:** `src/nls/messages_en.json` should **NOT** be edited manually, instead edit the defaultMessage in the code and re-run the script.

Configuration for the message bundles can be found in `config_frontend/config.json`:
- `locales.build` lists the locales for which message bundles will be produced
- `locales.supported` lists the locales that will be loaded at runtime based on browser language settings

For testing and development purposes the list of supported locales can be overridden to include all built locales by adding a known value to `localStorage`:

`localStorage.setItem('tkn-locale-dev', true);`

and refreshing the page. When done, to return to normal production behaviour, remove the override:

`localStorage.removeItem('tkn-locale-dev');`

## Storybook

Run `npm run storybook` to start [storybook](https://storybook.js.org/) in development mode. It automatically opens 
[`http://localhost:5000/`](http://localhost:5000/) in your browser. The app automatically hot-reloads any changes to the source files, including CSS.

Stories are defined in `*.stories.js` files alongside their components.

Run `npm run storybook:build` to build the static storybook files. The build artifacts will be stored in the `static-storybook/` directory and can be hosted on GitHub Pages or any other static resource server.

## Troubleshooting

Keep in mind that When running your Tekton Pipelines, if you see a `fatal: could not read Username for *GitHub repository*: No such device or address` message in your failing Task logs, this indicates there is no `tekton.dev/git` annotated GitHub secret in use by the ServiceAccount that launched this PipelineRun. It is advised to create one through the Tekton Dashboard. The annotation will be added and the specified ServiceAccount will be patched.

## Next steps

You can read the dashboard backend [API docs](./api.md).

Go though our [walk-throughs](../walkthrough/README.md) or learn about [extensions](../extensions.md).

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
