const ESLint = require("./eslint");
const Prettier = require("./prettier");
const Stylelint = require("./stylelint");
const SwiftLint = require("./swiftlint");

const linters = {
	eslint: ESLint,
	prettier: Prettier,
	stylelint: Stylelint,
	swiftlint: SwiftLint,
};

module.exports = linters;
