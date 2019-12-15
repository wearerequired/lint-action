const ESLint = require("./eslint");
const Flake8 = require("./flake8");
const Prettier = require("./prettier");
const Stylelint = require("./stylelint");
const SwiftLint = require("./swiftlint");

const linters = {
	eslint: ESLint,
	flake8: Flake8,
	prettier: Prettier,
	stylelint: Stylelint,
	swiftlint: SwiftLint,
};

module.exports = linters;
