const { defaults } = require('jest-config');

module.exports = {
    roots: ['<rootDir>/src/', '<rootDir>/tests/'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
    collectCoverageFrom: ["src/**/*.{ts,js}", "!src/index.ts"],
    testURL: 'http://localhost/' // cheat to fix SecurityError: localStorage is not available for opaque origins error see https://github.com/jsdom/jsdom/issues/2304
};
