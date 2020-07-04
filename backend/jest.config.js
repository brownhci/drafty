const path = require("path");

module.exports = {
    displayName: {
      name: "BACKEND",
      color: "magenta",
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
    testEnvironment: "node",
    collectCoverage: true,
    coverageDirectory: path.join(process.cwd(), "test", "coverage", "backend"),
    coverageReporters: ["json", "text", "html"],
    verbose: true
};
