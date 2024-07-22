# @tektoncd/dashboard-components

> React components for the Tekton Dashboard

## Getting started

To install `@tektoncd/dashboard-components` in your project, you will need to run the following
command using [npm](https://www.npmjs.com/):

```bash
npm install -S @tektoncd/dashboard-components
```

If you prefer [Yarn](https://yarnpkg.com/en/), use the following command
instead:

```bash
yarn add @tektoncd/dashboard-components
```

You will also need to install the Carbon packages which provide the base styling and components:
- [Carbon Components React](https://carbondesignsystem.com/developing/frameworks/react)

This package requires [Dart Sass](http://npmjs.com/package/sass) in order to
compile styles.

If you're new to Sass, we recommend checking out the following resources and
links:

- [Sass Basics](https://sass-lang.com/guide)

For info on how to configure Sass for your project, here are some common
frameworks' documentation worth reviewing:

- [Next.js with Sass](https://nextjs.org/docs/basic-features/built-in-css-support#sass-support)
- [Remix with Sass](https://remix.run/docs/en/1.19.2/guides/styling#css-preprocessors)
- [Gatsby with Sass](https://www.gatsbyjs.com/docs/how-to/styling/sass/)

Or if you're just using a bundler:

- [Parcel with Sass](https://parceljs.org/languages/sass/)
- [Vite with Sass](https://vitejs.dev/guide/features.html#css-pre-processors)

Or anything else not listed above:

- [Webpack with Sass](https://webpack.js.org/loaders/sass-loader/)
- [Create React App with Sass](https://create-react-app.dev/docs/adding-a-sass-stylesheet/)
- [Snowpack with Sass](https://www.snowpack.dev/guides/sass/)

## Usage

The `@tektoncd/dashboard-components` package provides components and icons used by the Tekton Dashboard.

To use a component, you can import it directly from the package:

```jsx
import { StatusIcon } from '@tektoncd/dashboard-components';

function MyComponent() {
  return <StatusIcon status="Unknown" reason="Pending" />;
}
```

To include the styles for a specific component:

```scss
@import '@tektoncd/dashboard-components/src/components/StatusIcon/StatusIcon.scss';
```

For a full list of components available, checkout our
[Storybook](https://tektoncd.github.io/dashboard/).

## 📖 API Documentation

If you're looking for `@tektoncd/dashboard-components` API documentation, check out:

- [Storybook](https://tektoncd.github.io/dashboard/)

## 🙌 Contributing

We're always looking for contributors to help us fix bugs, build new features,
or help us improve the project documentation. If you're interested, definitely
check out our [Contributing Guide](/CONTRIBUTING.md)! 👀

---

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/). Code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
