# Developing

## Getting started

Many of the instructions here replicate what's in the [tektoncd/pipeline development guide](https://github.com/tektoncd/pipeline/blob/master/DEVELOPMENT.md), with a couple of caveats currently.

- This project has not yet been tested with GKE

### Requirements

You must install these tools:

1. [`go`](https://golang.org/doc/install): The language Tekton Dashboard is built in
1. [`git`](https://help.github.com/articles/set-up-git/): For source control
1. [`ko`](https://github.com/google/ko): For development. `ko` version v0.1 or higher is required for `dashboard` to work correctly.
1. [Node.js & npm](https://nodejs.org/): For building and running the frontend locally. See `engines` in [package.json](./package.json) for versions used. _Node.js 10.x is recommended_
1. [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/): For interacting with your kube cluster.
1. [`kustomize`](https://github.com/kubernetes-sigs/kustomize/blob/master/docs/INSTALL.md): For building the Dashboard kube config. You need a recent version - v3.5.4 is recommended. See [here](https://github.com/kubernetes-sigs/kustomize/blob/master/docs/INSTALL.md#try-go) - `GO111MODULE=on go install sigs.k8s.io/kustomize/kustomize/v3` works correctly. 

Your [`$GOPATH`] setting is critical for `ko apply` to function properly: a
successful run will typically involve building pushing images instead of only
configuring Kubernetes resources.

Note that there exists a bug in certain versions of `kubectl` whereby the `auth` field is missing from created secrets. Known good versions we've tested are __1.15.0__ and __1.16.2__.

### Checkout your fork

The Go tools require that you clone the repository to the
`src/github.com/tektoncd/dashboard` directory in your
[`GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH).

To check out this repository:

1. Create your own
   [fork of this repo](https://help.github.com/articles/fork-a-repo/)
1. Clone it to your machine:

```shell
mkdir -p ${GOPATH}/src/github.com/tektoncd
cd ${GOPATH}/src/github.com/tektoncd
git clone git@github.com:${YOUR_GITHUB_USERNAME}/dashboard.git
cd dashboard
git remote add upstream git@github.com:tektoncd/dashboard.git
git remote set-url --push upstream no_push
```

_Adding the `upstream` remote sets you up nicely for regularly
[syncing your fork](https://help.github.com/articles/syncing-a-fork/)._

## Environment Setup

- We've had good success using Docker Desktop: ensure your Kubernetes cluster is healthy and you have plenty of disk space allocated as PVs will be created for PipelineRuns.
- Ensure you can push images to a Docker registry - the above listed requirements are only for local development, otherwise we pull in the tooling for you in the image.

1. `GOPATH`: If you don't have one, simply pick a directory and add
   `export GOPATH=...`
1. `$GOPATH/bin` on `PATH`: This is so that tooling installed via `go get` will
   work properly.
1. `KO_DOCKER_REPO`: The docker repository to which developer images should be
   pushed (e.g. `gcr.io/[gcloud-project]` or `docker.io<myusername>`). You can also run a local registry
   and set `KO_DOCKER_REPO` to reference the registry (e.g. at
   `localhost:5000/mydashboardimages`).

`.bashrc` example:

```shell
export GOPATH="$HOME/go"
export PATH="${PATH}:${GOPATH}/bin"
export KO_DOCKER_REPO='docker.io/myusername'
```

Make sure to configure
[authentication](https://cloud.google.com/container-registry/docs/advanced-authentication#standalone_docker_credential_helper)
for your `KO_DOCKER_REPO` if required. To be able to push images to
`gcr.io/<project>`, you need to run this once:

```shell
gcloud auth configure-docker
```

The user you are using to interact with your k8s cluster must be a cluster admin
to create role bindings:

```shell
# Using gcloud to get your current user
USER=$(gcloud config get-value core/account)
# Make that user a cluster admin
kubectl create clusterrolebinding cluster-admin-binding \
  --clusterrole=cluster-admin \
  --user="${USER}"
```

## Iterating

While iterating on the project, you may need to:

1. Run the Alpine based Go tests in Docker with: `docker build -f Dockerfile_test .`
1. Run the Stretch based Go tests with race condition checking in Docker with: `docker build -f Dockerfile_race_test .`
1. Install the dashboard
1. Interact with the created Kubernetes service - we've had success using Postman on Mac and data provided must be JSON

Tekton Dashboard does not involve any custom resource definitions, we only interact with them.

## Install dashboard

You can stand up a version of the dashboard on-cluster (to your
`kubectl config current-context`):

First install and build the npm project. Install with a clean slate of dependencies, if a node_modules folder is already present in the project root it will be automatically removed before install.

```shell
npm ci 
```

There is a dedicated npm job for ko builds

```shell
npm run build_ko
```

This will build the static resources and add them to the `kodata` directory.

Development dashboard builds come in four flavours: (plain kube or Openshift) * (read-only or read-write):
```shell
# Plain Kube
kustomize build overlays/dev | ko apply -f -
kustomize build --load_restrictor=LoadRestrictionsNone overlays/dev-locked-down | ko apply -f -

# OpenShift
kustomize build overlays/dev-openshift --load_restrictor=LoadRestrictionsNone \
 | ko resolve -f - | kubectl apply -f - --validate=false
kustomize build overlays/dev-openshift-locked-down --load_restrictor=LoadRestrictionsNone \
 | ko resolve -f - | kubectl apply -f - --validate=false
```

We also provide a version for working with OpenShift image streams:
```shell
kustomize build overlays/dev-openshift-imagestream --load_restrictor=LoadRestrictionsNone | ko resolve -f - | kubectl apply -f - --validate=false
```

## Access the dashboard

The dashboard can be accessed by running `kubectl proxy`, which proxies requests through the API Server. You can access the web UI at `localhost:8001/api/v1/namespaces/tekton-pipelines/services/tekton-dashboard:http/proxy/`

Important note: the setting for a CSRF secure cookie must be *false* if you intend to access the Dashboard pod through port-forward. Otherwise, it should be true (for example, when using a Route, or Ingress, which is secured with TLS).
You can disable the Secure attribute on the CSRF cookie by adding `--csrf-secure-cookie=false` in the command line args when starting the dashboard backend.

### Redeploy dashboard

As you make changes to the code, you can redeploy your dashboard by simply using `ko apply` against the `config` directory again.

### Tear it down

You can clean up everything with:

```shell
ko delete -f config/
```

## Accessing logs

To look at the dashboard logs, run:

```shell
kubectl logs -l app=tekton-dashboard
```

## Changing the target ARCH

You can build for another ARCH by overriding GOARCH (`amd64` by default).

With `Dockerfile`:

```shell
docker build --build-arg GOARCH=ppc64le .
```

With `ko`:

```shell
export GOARCH=ppc64le
kustomize build overlays/dev | ko apply -f -
```

## Frontend

### Install dependencies

```bash
npm install
```

### Development server

Run `npm start` for a dev server. Navigate to `http://localhost:8000/` in your browser. The app will automatically hot-reload any changes to the source files, including CSS. If it is unable to hot-reload it will fallback to a full page refresh.

Note: If you've exposed the backend by some other means than port-forwarding port 9097 as described above, update `API_DOMAIN` in `config_frontend/config.json` to provide the correct details.

Note: If modifying any of the sub-packages (e.g. components or utils in https://github.com/tektoncd/dashboard/tree/master/packages), you'll need to run `npm run bootstrap` to ensure those packages are correctly built and linked before starting the dev server or running a build. This is done automatically by `npm ci` or `npm install` so you may not have to run it directly depending on your workflow.

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. This will perform a production build of the static resources. It correctly bundles React in production mode and optimizes the build for the best performance. Filenames include hashes to facilitate long-term caching.

### i18n

This project uses `react-intl` for internationalization, and provides a script to automatically extract messages to bundles for translation. Run `npm run i18n:extract` from the root of the project to update the message bundles which can be found in `src/nls/`.

Note: `src/nls/messages_en.json` should **NOT** be edited manually, instead edit the defaultMessage in the code and re-run the script.

### Running unit tests

Run `npm test` to execute the unit tests via [Jest](https://jestjs.io/) in interactive watch mode. This also generates a code coverage report by default.

Coverage threshold is set to 90%, if it falls below the threshold the test script will fail.

Tests are defined in `*.test.js` files alongside the code under test.

### Linting

Run `npm run lint` to execute the linter (eslint + prettier). This will ensure code follows the conventions and standards used by the project.

Run `npm run lint:fix` to automatically fix a number of types of problem including code style.

### Storybook

Run `npm run storybook` to start [storybook](https://storybook.js.org/) in development mode. Navigate to [`http://localhost:4000/`](http://localhost:4000/) in your browser. The app will automatically hot-reload any changes to the source files, including CSS.

Stories are defined in `*.stories.js` files alongside their components.

Run `npm run storybook:build` to build the static storybook files. The build artifacts will be stored in the `static-storybook/` directory and can be hosted on GitHub Pages or any other static resource server.

## API definitions

The backend API provides the following endpoints at `/v1/namespaces/<namespace>`:

__GET endpoints__

__Dashboard Endpoints__
```
GET /v1/namespaces/<namespace>/endpoints
Get the registered `tekton-dashboard` entry points (route and ingress) host values
Returns HTTP code 200 and the registered dashboard ingress host value 
Returns HTTP code 404 if an error occurred getting the ingress

Example payload response is formatted as so:

[
 {
  "type": "Route",
  "url": "tekton-dashboard-tekton-pipelines.apps.192.168.222.145.nip.io"
 },
 {
  "type": "Ingress",
  "url": "tekton-dashboard.192.168.222.145.nip.io"
 }
]
```

__Dashboard Ingress__
```
GET /v1/namespaces/<namespace>/ingress
Get the registered `tekton-dashboard` ingress host value
Returns HTTP code 200 and the registered dashboard ingress host value 
Returns HTTP code 404 if an error occurred getting the ingress
```

__Extensions__
```
GET /v1/extensions
Get all extensions in the given namespace
Returns HTTP code 500 if an error occurred getting the extensions
Returns HTTP code 200 and the given extensions in the given namespace if found, otherwise an empty list is returned
```

__Dashboard Properties__
```
GET /v1/properties
Get the properties of the tekton-dashboard which includes the:
- Tekton Dashboard namespace
- Tekton Dashboard version
- Tekton Pipelines namespace
- Tekton Pipelines version
- Tekton Triggers namespace
- Tekton Triggers version

Example payload response is formatted as so:

{
 "DashboardNamespace": "tekton-pipelines",
 "DashboardVersion": "devel",
 "PipelineNamespace": "tekton-pipelines",
 "PipelineVersion": "v0.10.0",
 "TriggersNamespace": "tekton-pipelines",
 "TriggersVersion": "v0.3.1",
 "IsOpenShift": false,
 "ReadOnly": true
}
```


## Extension

The Dashboard can be extended by registering extensions. There are two types

__Proxied Bundles__

The extension is discovered by adding the label and the annotations in the extension service.
```
  annotations:
    tekton-dashboard-endpoints: <path of the extension at the proxy>
    tekton-dashboard-display-name: <display name of the extension>  (optional)
    tekton-dashboard-bundle-location: <ui bundle location of the extension>  (optional)
  labels:
    tekton-dashboard-extension: "true"
```

1. Each extension is mounted onto /v1/extensions/extension-name/ at the dashboard
1. Requests to /v1/extensions/extension-name/ are routed to / at the extension in question. / at the extension is always exposed in the expectation that many extensions will only need one endpoint.
1. If tekton-dashboard-endpoints is set to foo then /v1/extensions/extension-name/foo is routed to /foo at the extension
1. Multiple context roots can be specified by using the . character to separate them: e.g. if tekton-dashboard-endpoints: foo.bar then /v1/extensions/extension-name/foo is routed to /foo and /v1/extensions/extension-name/bar is routed to /bar at the extension.
1. "/" is a reserved context root for javascript.  "tekton-dashboard-endpoints" must be always set if the extension has javascript.

__Kubernetes Resources__

These extensions give the dashboard the ability to show a list of resources for a given Kubernetes resource kind. 
A link to this list is exposed in the nav similar to bundled extensions. 
Selecting an item from the list provides a more detailed view of the selected resource.

There are 2 steps to exposing a resource type.

1. The `tekton-dashboard` service account must have access to the target resources. To allow such access you can extend the `tekton-dashboard` `ClusterRole` by creating a `ClusterRole` containing the necessary permissions and attach the `rbac.dashboard.tekton.dev/aggregate-to-dashboard: "true"` label to it.

Replace `rules.apiGroups` and `rules.resources` with the target values for the resource.

```
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: tekton-dashboard-extensions
  labels:
    rbac.dashboard.tekton.dev/aggregate-to-dashboard: "true"
rules:
  - apiGroups: ["targetGroup"]
    resources: ["targetResource"]
    verbs: ["get", "list", "watch"]
```

2. Add an extension resource specifying the target resource to be listed. Replace `metadata.name`, 
`spec.apiVersion`, `spec.name` and `spec.displayName`with required values.

```
apiVersion: dashboard.tekton.dev/v1alpha1
kind: Extension
metadata:
  name: extensionname
spec:
  apiVersion: target resource api version
  name: targetResource
  displayname: display name on the dashboard
```

Extensions in this context are custom resources defined in the dashboard installation. The apiVersion is `dashboard.tekton.dev/v1alpha1`.

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/).

Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
