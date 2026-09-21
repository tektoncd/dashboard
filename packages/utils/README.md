# @tektoncd/dashboard-utils

> Common code, utilities, and constants used across the Tekton Dashboard

## Getting started

To install `@tektoncd/dashboard-utils` in your project, you will need to run the following
command using [npm](https://www.npmjs.com/):

```bash
npm install -S @tektoncd/dashboard-utils
```

If you prefer [Yarn](https://yarnpkg.com/en/), use the following command
instead:

```bash
yarn add @tektoncd/dashboard-utils
```

`react-router` v7 is required as a peer dependency.

> **Note:** `RouterProvider` is configured with `useTransitions={false}`
> to disable `React.startTransition` for router state updates. Combining
> transition-enabled navigations with synchronous external state updates
> (e.g. context writes) in the same event handler as `navigate()` calls
> can cause a temporary desync between router state and component state.
> This may be revisited if view transitions are adopted in future.

## Usage

To use a function or value, you can import it directly from the package:

```jsx
import { resourceNameRegex } from '@tektoncd/dashboard-utils';

resourceNameRegex.test(myResourceName)
```

## 🙌 Contributing

We're always looking for contributors to help us fix bugs, build new features,
or help us improve the project documentation. If you're interested, definitely
check out our [Contributing Guide](/CONTRIBUTING.md)! 👀

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
