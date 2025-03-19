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
- [Run frontend tests](#run-frontend-tests)
  - [Frontend unit tests](#frontend-unit-tests)
  - [Frontend E2E tests](#frontend-e2e-tests)
  - [Linter](#linter)
- [i18n](#i18n)
- [Storybook](#storybook)
- [Next steps](#next-steps)

## Pre-requisites

In order to run the Tekton Dashboard, please make sure the requirements in [the install doc](../install.md) are met.

You will also need the following tools in order to build the Dashboard locally and deploy it:
1. [`go`](https://golang.org/doc/install): The language the Tekton Dashboard backend is built in, see `go.mod` for the version expected
1. [`git`](https://help.github.com/articles/set-up-git/): For source control
1. [Node.js & npm](https://nodejs.org/): For building and running the frontend locally. See [`.nvmrc`](/.nvmrc) for version, or run `nvm use`
1. [`ko`](https://github.com/google/ko): For building the backend locally. `ko` version v0.15.x
1. [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/): For interacting with your kube cluster
1. [`kustomize`](https://kubectl.docs.kubernetes.io/installation/kustomize/): For building the Dashboard manifests. v5.3.0 is known to work

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

## Build the frontend

First install the required dependencies:

```bash
npm install
```

See instructions for running the development server in the section below.

To run the production build:

```bash
npm run build
```

This will build the static resource bundles and add them to the `cmd/dashboard/kodata` directory.

To run the dev server with the production bundles:

```bash
npm run preview
```

**Note**: To help ensure the build process is efficient and content is transformed as required for current browser support, JSX processing is only performed on files with a `.jsx` extension. This means that if a file contains JSX expressions (e.g. `<MyComponent … />` or `<span>…</span>`), it must be named with a `.jsx` extension. This applies to all files containing JSX, including tests, stories, etc.

### Command line arguments

The dashboard backend supports a number of options through command line arguments.

These options are documented below:

| Argument | Description | Type | Default value |
|---|---|---|---|
| `--help` | Print help message and exit | `bool` | `false` |
| `--pipelines-namespace` | Namespace where Tekton pipelines is installed (assumes same namespace as dashboard if not set) | `string` | `""` |
| `--triggers-namespace` | Namespace where Tekton triggers is installed (assumes same namespace as dashboard if not set) | `string` | `""` |
| `--port` | Dashboard port number | `int` | `8080` |
| `--read-only` | Enable or disable read-only mode | `bool` | `true` |
| `--logout-url` | If set, enables logout on the frontend and binds the logout button to this URL | `string` | `""` |
| `--default-namespace` | If set, configures the default selected namespace to the provided namespace instead of 'All Namespaces' | `string` | `""` |
| `--namespaces` | If set, limits the scope of resources displayed to this comma-separated list of namespaces only | `string` | `""` |
| `--log-level` | Minimum log level output by the logger | `string` | `"info"` |
| `--log-format` | Format for log output (json or console) | `string` | `"json"` |

Run `dashboard --help` to show the supported command line arguments and their default values directly from the `dashboard` binary.

**Important note:** using `--namespaces` provides this list of namespaces to the frontend, but does not limit actions that can be performed to just these namespaces. It's important when this flag is used that RBAC rules are setup accordingly.

## Build and deploy with the installer script

To build and deploy the Dashboard backend easily, you can use the [installer script](./installer.md).

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:8000/` in your browser. The app will automatically hot-reload any changes to the source files, including CSS. If it is unable to hot-reload it will fallback to a full page refresh.

Make sure that the backend service running in the cluster is proxied using `kubectl --namespace tekton-pipelines port-forward svc/tekton-dashboard 9097:9097`.

**Note:** If you've exposed the backend by some other means than port-forwarding port 9097 as described above, set the `API_DOMAIN` environment variable to provide the correct details.

e.g. to connect your local dev frontend to the Dashboard deployed on the robocat cluster:
`API_DOMAIN=https://dashboard.robocat.tekton.dev/ npm start`

## Quick setup for local cluster

The Dashboard repository contains a script that will provision a [`kind` cluster](https://kind.sigs.k8s.io/) named 'tekton-dashboard' with the latest releases of Tekton Pipelines and Tekton Triggers installed, as well as a version of the Tekton Dashboard which can be customised by providing additional parameters matching those expected by the installer script described earlier.

For example, the following will create a cluster with a local build of the Tekton Dashboard with log streaming enabled:

`./scripts/prepare-kind-cluster create`

To delete the cluster:

`./scripts/prepare-kind-cluster delete`

To create a cluster with the Tekton Dashboard exposed via ingress at `tekton-dashboard.127.0.0.1.nip.io`:

`./scripts/prepare-kind-cluster create-with-ingress`

This ensures the cluster is created with the required node labels and port mappings (ports 80 and 443).

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

## Run frontend tests

### Frontend unit tests

Run `npm test` to execute the unit tests via [Vitest](https://vitest.dev/) in interactive watch mode. This also generates a code coverage report by default.

Coverage threshold is set to 90%, if it falls below the threshold the test script will fail.

Tests are defined in `*.test.js(x)` files alongside the code under test.

### Frontend E2E tests

First install the required dependencies:

```bash
npm run e2e:install
```

This installs [Cypress](https://www.cypress.io/) and its dependencies, and must be run before executing the tests the first time as well as whenever the E2E dependencies are updated.

Now you can execute the end-to-end UI tests via Cypress in interactive mode:

```bash
npm run e2e
```

Tests are defined in `*.cy.js` files in `packages/e2e/cypress`.

By default tests are run using Chrome but you can override this by specifying an alternative supported browser available on your system, for example:

`npm run e2e -- -- --browser firefox`

To find the list of supported browsers and versions on your system, run `npx cypress info`

### Linter

Run `npm run lint` to execute the linter (eslint + prettier). This will ensure code follows the conventions and standards used by the project.

Run `npm run lint:fix` to automatically fix a number of types of problem including code style.

## i18n

This project uses `react-intl` for internationalization, and provides a script to automatically extract messages to bundles for translation. Run `npm run i18n:extract` from the root of the project to update the message bundles which can be found in `src/nls/`.

**Note:** `src/nls/messages_en.json` should **NOT** be edited manually, instead edit the defaultMessage in the code and re-run the script.

Configuration for the message bundles can be found in `.env`:
- `VITE_LOCALES_BUILD` lists the locales for which message bundles will be produced
- `VITE_LOCALES_SUPPORTED` lists the locales that will be loaded at runtime based on browser language settings

For testing and development purposes the list of supported locales can be overridden to include all built locales by adding a known value to `localStorage`:

`localStorage.setItem('tkn-locale-dev', true);`

and refreshing the page. When done, to return to normal production behaviour, remove the override:

`localStorage.removeItem('tkn-locale-dev');`

You can also run the Dashboard in 'i18n mode' which enables all built locales via an override in `.env.i18n`:

`npm run i18n:start`

## Storybook

Run `npm run storybook` to start [storybook](https://storybook.js.org/) in development mode. It automatically opens 
[`http://localhost:5000/`](http://localhost:5000/) in your browser. The app automatically hot-reloads any changes to the source files, including CSS.

Stories are defined in `*.stories.js(x)` files alongside their components.

Run `npm run storybook:build` to build the static storybook files. The build artifacts will be stored in the `static-storybook/` directory and can be hosted on GitHub Pages or any other static resource server.

**Note**: The Storybook for the latest published packages is available at https://tektoncd.github.io/dashboard/. For previous versions, checkout the relevant commit and run Storybook locally.

## Next steps

You can read the dashboard backend [API docs](./api.md).

Try our [walk-throughs](../walkthrough/README.md) or learn about [extensions](../extensions.md).

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
