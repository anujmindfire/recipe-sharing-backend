export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 72],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-full-stop': [2, 'never', '.'],
    'body-max-line-length': [1, 'always', 72],
    'body-empty': [0, 'always'],
    'footer-empty': [0, 'always'],
  },
};
