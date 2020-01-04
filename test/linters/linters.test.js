const { copySync, removeSync } = require("fs-extra");
const { join } = require("path");
const { normalizeDates } = require("../utils");
const blackParams = require("./params/black");
const eslintParams = require("./params/eslint");
const eslintTypescriptParams = require("./params/eslint-typescript");
const flake8Params = require("./params/flake8");
const gofmtParams = require("./params/gofmt");
const golintParams = require("./params/golint");
const prettierParams = require("./params/prettier");
const stylelintParams = require("./params/stylelint");
const swiftlintParams = require("./params/swiftlint");

const linterParams = [
	blackParams,
	eslintParams,
	eslintTypescriptParams,
	flake8Params,
	gofmtParams,
	golintParams,
	prettierParams,
	stylelintParams,
];

// Only run Swift tests on macOS
if (process.platform === "darwin") {
	linterParams.push(swiftlintParams);
}

describe.each(linterParams)(
	"%s",
	(projectName, linter, extensions, getLintParams, getFixParams) => {
		const projectDir = join(__dirname, "projects", projectName);
		const tmpDir = join(__dirname, "..", "tmp", projectName);
		const lintParams = getLintParams(tmpDir);
		const fixParams = getFixParams(tmpDir);

		beforeAll(async () => {
			// Move test project into temporary directory (where files can be modified by the linters)
			copySync(projectDir, tmpDir);
			await linter.verifySetup(tmpDir);
		});

		afterAll(() => {
			// Remove temporary directory after test completion
			removeSync(tmpDir);
		});

		test(`${linter.name} returns correct lint results`, () => {
			let actualStdout = linter.lint(tmpDir, extensions);
			actualStdout = normalizeDates(actualStdout);
			if ("stdout" in lintParams) {
				expect(actualStdout).toEqual(lintParams.stdout);
			} else if ("stdoutParts" in lintParams) {
				lintParams.stdoutParts.forEach(stdoutPart =>
					expect(actualStdout).toEqual(expect.stringContaining(stdoutPart)),
				);
			} else {
				throw Error("`lintParams` must contain either `stdout` or `stdoutParts` key");
			}
		});

		test(`${linter.name} parses lint results correctly`, () => {
			const actualParsed = linter.parseResults(tmpDir, lintParams.parseInput);
			expect(actualParsed).toEqual(lintParams.parseResult);
		});

		test(`${linter.name} returns correct auto-fix results`, () => {
			let actualStdout = linter.lint(tmpDir, extensions, true);
			actualStdout = normalizeDates(actualStdout);
			if ("stdout" in fixParams) {
				expect(actualStdout).toEqual(fixParams.stdout);
			} else if ("stdoutParts" in fixParams) {
				fixParams.stdoutParts.forEach(stdoutPart =>
					expect(actualStdout).toEqual(expect.stringContaining(stdoutPart)),
				);
			} else {
				throw Error("`fixParams` must contain either `stdout` or `stdoutParts` key");
			}
		});

		test(`${linter.name} parses auto-fix results correctly`, () => {
			const actualParsed = linter.parseResults(tmpDir, fixParams.parseInput);
			expect(actualParsed).toEqual(fixParams.parseResult);
		});
	},
);
