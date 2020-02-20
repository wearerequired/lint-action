const RuboCopBundler = require("../../../src/linters/rubocopBundler");
const params = require("./rubocop");

const testName = "rubocop_bundler";
const linter = RuboCopBundler;
const extensions = ["rb"];

module.exports = [testName, linter, extensions, params[3], params[4]];
