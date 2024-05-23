/************************************************************************
 *                          ESLINT CONFIG FILE                          *
 *                                                                      *
 * This file contains the custom lint rules for this repository. To     *
 * lint the project, run this command in the root directory:            *
 *                                                                      *
 *    npx eslint -c eslint.config.js                                    *
 *                                                                      *
 * The linter output SHOULD ALWAYS BE CLEAN before any commit to keep   *
 * everything neat and organized.                                       *
 ************************************************************************/

import stylisticJs from '@stylistic/eslint-plugin-js';

// Who lints the linter?
/* eslint-disable no-magic-numbers */
export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        ignores: [], // Putting this here now, it'll get added to as the project grows
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            '@stylistic/js/brace-style': [
                'error',
                '1tbs',
                { allowSingleLine: true }
            ],
            '@stylistic/js/comma-dangle': [
                'error'
            ],
            '@stylistic/js/comma-spacing': [
                'error'
            ],
            '@stylistic/js/comma-style': [
                'error'
            ],
            curly: [
                'error'
            ],
            '@stylistic/js/dot-location': [
                'error',
                'property'
            ],
            eqeqeq: [
                'error'
            ],
            '@stylistic/js/function-call-argument-newline': [
                'error',
                'consistent'
            ],
            '@stylistic/js/function-call-spacing': [
                'error'
            ],
            '@stylistic/js/function-paren-newline': [
                'error'
            ],
            '@stylistic/js/indent': [
                'error',
                4,
                { SwitchCase: 1 }
            ],
            '@stylistic/js/key-spacing': [
                'error'
            ],
            '@stylistic/js/keyword-spacing': [
                'error'
            ],
            '@stylistic/js/linebreak-style': [
                'error'
            ],
            '@stylistic/js/newline-per-chained-call': [
                'error',
                { ignoreChainWithDepth: 3 }
            ],
            'no-magic-numbers': [
                'error',
                { ignore: [ -1, 0, 1, 2 ], ignoreArrayIndexes: true }
            ],
            '@stylistic/js/no-multi-spaces': [
                'error',
                { 'ignoreEOLComments': true }
            ],
            '@stylistic/js/no-multiple-empty-lines': [
                'error',
                { max: 1 }
            ],
            '@stylistic/js/no-tabs': [
                'error'
            ],
            '@stylistic/js/no-trailing-spaces': [
                'error'
            ],
            'no-var': [
                'error'
            ],
            '@stylistic/js/no-whitespace-before-property': [
                'error'
            ],
            '@stylistic/js/object-curly-newline': [
                'error'
            ],
            '@stylistic/js/object-curly-spacing': [
                'error',
                'always'
            ],
            '@stylistic/js/object-property-newline': [
                'error',
                { allowAllPropertiesOnSameLine: true }
            ],
            'prefer-const': [
                'error'
            ],
            '@stylistic/js/quotes': [
                'error',
                'single'
            ],
            'require-await': [
                'error'
            ],
            '@stylistic/js/semi': [
                'error'
            ],
            '@stylistic/js/semi-spacing': [
                'error'
            ],
            'sort-imports': [
                'error',
                { ignoreCase: true, memberSyntaxSortOrder: [ 'single', 'multiple', 'none', 'all' ] }
            ],
            '@stylistic/js/space-in-parens': [
                'error'
            ],
            '@stylistic/js/spaced-comment': [
                'error',
                'always',
                { exceptions: ['*'] }
            ],
            '@stylistic/js/switch-colon-spacing': [
                'error'
            ],
            '@stylistic/js/template-curly-spacing': [
                'error'
            ]
        }
    }
];
