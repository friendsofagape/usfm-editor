module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["jest"],
  settings: {
    react: {
      // eslint-plugin-react should detect React version
      version: "detect"
    }
  },
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:jest/style"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", {
      "args": "after-used",
      "argsIgnorePattern": "^event$", // event handlers can ignore their arg
      "varsIgnorePattern": "^_", // const [_ignored, b, c] = destructureMe
    }],
  },
  "ignorePatterns": ["/dist/", "/docs/"]
};

