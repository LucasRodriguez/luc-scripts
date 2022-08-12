const path = require('path')
const {
  ifAnyDep,
  hasFile,
  ifFile,
  hasPkgProp,
  fromRoot,
  isEsm,
} = require('../utils')

const here = p => path.join(__dirname, p)

const useBuiltInBabelConfig =
  !hasFile('.babelrc') && !hasFile('.babelrc.js') && !hasPkgProp('babel')

const ignores = [
  '/node_modules/',
  '/__fixtures__/',
  '/fixtures/',
  '/__tests__/helpers/',
  '/__tests__/utils/',
  '__mocks__',
]

const jestConfig = {
  roots: [hasFile('src') ? '<rootDir>/src' : '<rootDir>'],
  testEnvironment: ifAnyDep(
    ['webpack', 'rollup', 'react', 'preact'],
    'jsdom',
    'node',
  ),
  testURL: 'http://localhost',
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  modulePaths: ['<rootDir>/src', 'shared', '<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.+(js|jsx|ts|tsx)'],
  testMatch: [
    '**/__tests__/**/*.+(js|jsx|ts|tsx)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [...ignores],
  coveragePathIgnorePatterns: [...ignores, 'src/(umd|cjs|esm)-entry.js$'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
  snapshotSerializers: [
    require.resolve('jest-serializer-path'),
    require.resolve('jest-snapshot-serializer-raw/always'),
  ],
}

const setupFilesAfterEnv = [
  ifAnyDep(
    '@testing-library/jest-dom',
    '@testing-library/jest-dom/extend-expect',
  ),
  ifFile('jest.setup.js', fromRoot('jest.setup.js')),
  ifFile('setupTests.js', fromRoot('setupTests.js')),
  ifFile('setupTests.js', fromRoot('setupTests.js')),
  ifFile('tests/setup-env.js', fromRoot('tests/setup-env.js')),
  ifFile('tests/setup-env.ts', fromRoot('tests/setup-env.ts')),
  ifFile('tests/setup-env.tsx', fromRoot('tests/setup-env.tsx')),
].filter(Boolean)

if (setupFilesAfterEnv.length) {
  jestConfig.setupFilesAfterEnv = setupFilesAfterEnv
}

if (useBuiltInBabelConfig) {
  jestConfig.transform = {
    '^.+\\.(js|jsx|ts|tsx)$': here('./babel-transform'),
  }
}

// make esmodules work
// https://jestjs.io/docs/ecmascript-modules
if (isEsm) {
  // see https://github.com/chalk/chalk/issues/532#issuecomment-1062018375
  jestConfig.moduleNameMapper = {
    '#(.*)': '<rootDir>/node_modules/$1',
  }
  jestConfig.transform = {}
}

if (jestConfig.testEnvironment === 'jsdom') {
  jestConfig.setupFiles = [require.resolve('react-app-polyfill/jsdom')]
}

module.exports = jestConfig
