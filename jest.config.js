/*
Copyright 2019-2020 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
    '<rootDir>/packages/**/src/**/*.js',
    '!<rootDir>/src/**/*.stories.js',
    '!<rootDir>/packages/**/src/**/*.stories.js'
  ],
  coverageReporters: ['html', 'text'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  },
  moduleNameMapper: {
    '\\.(png|svg|ttf|woff|woff2)$':
      '<rootDir>/config_frontend/__mocks__/fileMock.js',
    '\\.(css|scss)$': '<rootDir>/config_frontend/__mocks__/styleMock.js'
  },
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/config_frontend/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/packages/**/src/**/*.test.js'
  ]
};
