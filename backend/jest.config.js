module.exports = {
    testEnvironment: 'node', // or 'jsdom' for browser-like environment
    testMatch: ['**/__tests__/**/*.test.js'], // Match test files
    coverageDirectory: 'coverage', // Output directory for coverage reports
    collectCoverageFrom: ['**/*.js'], // Files to include in coverage reports
    moduleFileExtensions: ['js', 'json', 'node'],
  };