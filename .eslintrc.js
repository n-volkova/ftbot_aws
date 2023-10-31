module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest'
  },
  env: {
    es6: true
  },
  plugins: ['simple-import-sort'],
  extends: ['plugin:jsonc/recommended-with-jsonc'],
  rules: {
    'semi': 2,
    'no-useless-concat': 'error',
    'no-useless-constructor': 0,
    'no-multiple-empty-lines': 'error',
    'no-multi-spaces': 'error',
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
    ],
    'vue/html-indent': [
      'error',
      2
    ],
    camelcase: 'off',

    quotes: ['error', 'single', { avoidEscape: true }],
    'eol-last': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'no-extra-parens': 'error',
    // @NOTE: simple-import-sort requires to turn off other import-related sorting rules
    'sort-imports': 'off',
    'import/order': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
    ],
  },
  overrides: [
    {
      extends: ['plugin:jsonc/recommended-with-jsonc'],
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/sort-keys': [
          'error',
          {
            pathPattern: '.*',
            order: { type: 'asc' }
          },
        ],
      },
    },
  ]
};
