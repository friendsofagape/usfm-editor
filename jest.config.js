module.exports = {
    moduleNameMapper: {
      '\\.(css|less)$': '<rootDir>/test/cssStub.js',
    },
    setupFilesAfterEnv: ['<rootDir>/test/setupTests.js']
};