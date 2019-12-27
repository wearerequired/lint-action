const Black = require("./black");
const ESLint = require("./eslint");
const Flake8 = require("./flake8");
const Gofmt = require("./gofmt");
const Prettier = require("./prettier");
const Stylelint = require("./stylelint");
const SwiftLint = require("./swiftlint");

const linters = {
	// Linters
	eslint: ESLint,
	flake8: Flake8,
	stylelint: Stylelint,
	swiftlint: SwiftLint,

	// Formatters (should be run after linters)
	black: Black,
	gofmt: Gofmt,
	prettier: Prettier,
};

module.exports = linters;
