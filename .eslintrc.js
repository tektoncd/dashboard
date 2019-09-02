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
      "notice",
      "react"
  ],
  "rules": {
    "curly": ["error", "all"],
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "no-case-declarations": "off",
    "no-template-curly-in-string": "off",
    "notice/notice": [
      "error", { "templateFile": "config_frontend/copyright.txt", nonMatchingTolerance: 0.95 }
    ],
    "react/jsx-filename-extension": "off",
    "react/destructuring-assignment": "off",
    "react/prop-types": "off",
    "sort-imports": ["error", {
        "ignoreCase": true,
        "ignoreDeclarationSort": true
    }]
  }
};
