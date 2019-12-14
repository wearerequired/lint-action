const ESLint = require("./eslint");
const Stylelint = require("./stylelint");

const linters = {
	eslint: ESLint,
	stylelint: Stylelint,
};

module.exports = linters;
