module.exports = {
  env: {
    browser: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
  },
  root: true,
  settings: {
    react: {
      version: "16.13.1"
    }
  }
}
