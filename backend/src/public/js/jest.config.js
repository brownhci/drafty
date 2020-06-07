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
            tsConfig: path.join(path.resolve(__dirname), "tsconfig.frontend.json")
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
    coveragePathIgnorePatterns: ["/node_modules/", ".*mutation-observer.js"],
    coverageReporters: ["json", "text", "html"]
};
