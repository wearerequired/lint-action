const XO = require("../../../src/linters/xo");
const eslintParams = require("./eslint");

const testName = "xo";
const linter = XO;
const extensions = ["js"];

// Same expected output as ESLint
module.exports = [testName, linter, extensions, eslintParams[3], eslintParams[4]];
