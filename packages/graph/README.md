# @tektoncd/dashboard-graph

**NOTE:** This package contains components that are not currently stable. They may be incomplete or change significantly without notice, therefore are not recommended for consumption by others at this time.

> React components and utils for the Tekton Dashboard's pipeline visualisations

## Getting started

To install `@tektoncd/dashboard-graph` in your project, you will need to run the following
command using [npm](https://www.npmjs.com/):

```bash
npm install -S @tektoncd/dashboard-graph
```

If you prefer [Yarn](https://yarnpkg.com/en/), use the following command
instead:

```bash
yarn add @tektoncd/dashboard-graph
```

You will also need to install the Carbon packages which provide the base styling and components:
- [Carbon Components React](https://carbondesignsystem.com/developing/frameworks/react)

See the `@tektoncd/dashboard-components` documentation for details of setting up Sass for styling.

## Usage

To use a component, you can import it directly from the package:

```jsx
import { Graph } from '@tektoncd/dashboard-graph';

function MyComponent() {
  return <Graph edges={…} nodes={…} />;
}
```

To include the styles for the graph components:

```scss
@import '@tektoncd/dashboard-graph/src/components/newGraph.scss';
```

This will likely be separated out in future so that styles for each component can be imported separately.

For a full list of components available, checkout our
[Storybook](https://tektoncd.github.io/dashboard/).

## 📖 API Documentation

If you're looking for `@tektoncd/dashboard-graph` API documentation, check out:

- [Storybook](https://tektoncd.github.io/dashboard/)

## 🙌 Contributing

We're always looking for contributors to help us fix bugs, build new features,
or help us improve the project documentation. If you're interested, definitely
check out our [Contributing Guide](/CONTRIBUTING.md)! 👀

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
