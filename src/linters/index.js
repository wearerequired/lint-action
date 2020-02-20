const Black = require("./black");
const ESLint = require("./eslint");
const Flake8 = require("./flake8");
const Gofmt = require("./gofmt");
const Golint = require("./golint");
const Mypy = require("./mypy");
const Prettier = require("./prettier");
const RuboCop = require("./rubocop");
const RuboCopBundler = require("./rubocopBundler")
const Stylelint = require("./stylelint");
const SwiftFormat = require("./swiftformat");
const SwiftLint = require("./swiftlint");

const linters = {
	// Linters
	eslint: ESLint,
	flake8: Flake8,
	golint: Golint,
	mypy: Mypy,
	rubocop: RuboCop,
	rubocop_bundler: RuboCopBundler,
	stylelint: Stylelint,
	swiftlint: SwiftLint,

	// Formatters (should be run after linters)
	black: Black,
	gofmt: Gofmt,
	prettier: Prettier,
	swiftformat: SwiftFormat,
};

module.exports = linters;
