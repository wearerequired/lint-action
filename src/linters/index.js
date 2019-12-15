const ESLint = require("./eslint");
const Stylelint = require("./stylelint");
const SwiftLint = require("./swiftlint");

const linters = {
	eslint: ESLint,
	stylelint: Stylelint,
	swiftlint: SwiftLint,
};

module.exports = linters;
