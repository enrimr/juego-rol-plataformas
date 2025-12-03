module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'game.js',
    '!node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  verbose: true
};
