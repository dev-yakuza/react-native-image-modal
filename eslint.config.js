import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginJSDoc from 'eslint-plugin-jsdoc'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginFunctional from 'eslint-plugin-functional'
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-refresh': eslintPluginReactRefresh,
      'react-hooks': eslintPluginReactHooks,
      react: eslintPluginReact,
      jsdoc: eslintPluginJSDoc,
      unicorn: eslintPluginUnicorn,
      import: eslintPluginImport,
      functional: eslintPluginFunctional,
      'unused-imports': eslintPluginUnusedImports,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.recommended.rules,
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginJSDoc.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
          ignoreVoidOperator: true,
        },
      ],
      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-loss-of-precision': 'error',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          variables: false,
        },
      ],
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      'functional/prefer-readonly-type': [
        'error',
        {
          allowLocalMutation: true,
          allowMutableReturnType: true,
          ignoreClass: true,
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'import/no-duplicates': 'error',
      'import/exports-last': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'object',
            'type',
            'index',
          ],

          pathGroups: [
            {
              pattern: '{react,react-dom/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '.',
              group: 'index',
            },
            {
              pattern: './App',
              group: 'index',
            },
          ],

          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-null': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-handler-names': [
        'error',
        {
          eventHandlerPrefix: 'handle',
          eventHandlerPropPrefix: 'on',
        },
      ],
      'no-invalid-this': 'off',
      'no-loop-func': 'off',
      'no-loss-of-precision': 'off',
      'no-redeclare': 'off',
      'no-shadow': 'off',
      'no-throw-literal': 'error',
      'no-unused-expressions': 'off',
      'no-return-await': 'off',
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: true,
        },
      ],
      'linebreak-style': ['error', 'unix'],
      'nonblock-statement-body-position': ['error', 'beside'],
      'no-console': [
        'error',
        {
          allow: ['debug', 'warn', 'error'],
        },
      ],
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: {
            array: false,
            object: true,
          },

          AssignmentExpression: {
            array: true,
            object: true,
          },
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      'require-await': 'off',
      'max-depth': 'error',
      'object-shorthand': 'error',
      'no-unneeded-ternary': 'error',
      camelcase: [
        'error',
        {
          properties: 'never',
          allow: ['_UNSTABLE'],
        },
      ],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore',
        },
      ],
      complexity: 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      semi: 'off',
      'no-empty-function': 'off',
    },
  },
)
