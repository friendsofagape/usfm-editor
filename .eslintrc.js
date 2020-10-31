module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2015,
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
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
  "ignorePatterns": ["/dist/", "/docs/"]
};

