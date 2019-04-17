module.exports = {
  "parser": "babel-eslint",
  "env": {
      "browser": true,
      "es6": true,
      "jest": true,
      "node": true
  },
  "extends": [
    "airbnb",
    "plugin:prettier/recommended",
    "prettier/react"
  ],
  "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
      "ecmaFeatures": {
          "jsx": true
      },
      "ecmaVersion": 2018,
      "sourceType": "module"
  },
  "plugins": [
      "react"
  ],
  "rules": {
    "no-template-curly-in-string": "off",
    "react/jsx-filename-extension": "off",
    "react/destructuring-assignment": "off",
    "react/prop-types": "off",
    "jsx-a11y/anchor-is-valid": "off"
  },
  "overrides": [
    {
      "files": ["webpack.*.js", "config_frontend/setupTests.js", "*.stories.js"],
      "rules": {
        "import/no-extraneous-dependencies": ["error", { "devDependencies": true }]
      }
    }
  ]
};
