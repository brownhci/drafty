const path = require("path");
const {defaults} = require("jest-config");

module.exports = {
    rootDir: path.resolve(__dirname),
    displayName: {
      name: "FRONTEND",
      color: "red",
    },
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json"
        }
    },
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    errorOnDeprecated: true,
    testEnvironment: "jsdom",
    collectCoverage: true,
    coverageDirectory: path.join(process.cwd(), "test", "coverage", "frontend"),
    coverageReporters: ["json", "text", "html"]
};
