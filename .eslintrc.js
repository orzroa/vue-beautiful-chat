module.exports = {
  root: true,
  env: {
    'browser': true,
    'es2021': true,
    'vue/setup-compiler-macros': true
  },
  extends: ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'vue/no-v-html': 'off',

    /*
     * Following rules are not part of any preset and must be enabled manually
     * See https://vuejs.github.io/eslint-plugin-vue/rules/#uncategorized
     **/
    'vue/component-name-in-template-casing': 'error', // enforce PascalCase

    'vue/padding-line-between-blocks': 'error',

    'vue/script-indent': [
      'error',
      2,
      {
        switchCase: 1 // indent case statements 1 level
      }
    ],

    // Vue 3 specific rules
    'vue/component-api-style': ['error', ['script-setup', 'composition']],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],

    // Vue 3 deprecation warnings
    'vue/no-deprecated-v-on-native-modifier': 'error',
    'vue/no-deprecated-v-bind-sync': 'error',
    'vue/no-deprecated-v-is': 'error',
    'vue/no-deprecated-events-api': 'error',
    'vue/no-deprecated-filter': 'error',
    'vue/no-deprecated-functional-template': 'error',
    'vue/no-deprecated-html-element-is': 'error',
    'vue/no-deprecated-inline-template': 'error',
    'vue/no-deprecated-props-default-this': 'error',
    'vue/no-deprecated-router-link-tag-prop': 'error',
    'vue/no-deprecated-scope-attribute': 'error',
    'vue/no-deprecated-slot-attribute': 'error',
    'vue/no-deprecated-slot-scope-attribute': 'error',
    'vue/no-deprecated-v-on-number-modifiers': 'error',
    'vue/no-v-for-template-key': 'error',
    'vue/no-watch-after-await': 'error',
    'vue/prefer-import-from-vue': 'error',
    'vue/require-toggle-inside-transition': 'error',
    'vue/v-on-event-hyphenation': [
      'error',
      'always',
      {
        autofix: true
      }
    ]
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module'
  }
}
