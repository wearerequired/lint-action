const XO = require("../../../src/linters/xo");
const eslintParams = require("./eslint");

const testName = "xo";
const linter = XO;
const commandPrefix = "";
const extensions = ["js"];

// Same expected output as ESLint
module.exports = [testName, linter, commandPrefix, extensions, eslintParams[4], eslintParams[5]];
