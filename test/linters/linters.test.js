const { copySync, removeSync } = require("fs-extra");
const { join } = require("path");
const { normalizeDates } = require("../utils");
const blackParams = require("./params/black");
const eslintParams = require("./params/eslint");
const eslintTypescriptParams = require("./params/eslint-typescript");
const flake8Params = require("./params/flake8");
const gofmtParams = require("./params/gofmt");
const prettierParams = require("./params/prettier");
const stylelintParams = require("./params/stylelint");
const swiftlintParams = require("./params/swiftlint");

const linterParams = [
	blackParams,
	eslintParams,
	eslintTypescriptParams,
	flake8Params,
	gofmtParams,
	prettierParams,
	stylelintParams,
];

// Only run Swift tests on macOS
if (process.platform === "darwin") {
	linterParams.push(swiftlintParams);
}

describe.each(linterParams)(
	"%s",
	(
		projectName,
		linter,
		extensions,
		getLintResults,
		getFixResults,
		parsedLintResults,
		parsedFixResults,
	) => {
		const projectDir = join(__dirname, "projects", projectName);
		const tmpDir = join(__dirname, "tmp", projectName);

		// Lint results may contain variable information, e.g. file paths -> use getter functions
		const lintResults = getLintResults(tmpDir);
		const fixResults = getFixResults(tmpDir);

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
			let actualLintResults = linter.lint(tmpDir, extensions);
			actualLintResults = normalizeDates(actualLintResults);
			if (Array.isArray(lintResults)) {
				expect(lintResults).toContain(actualLintResults);
			} else {
				expect(actualLintResults).toEqual(lintResults);
			}
		});

		test(`${linter.name} parses lint results correctly`, () => {
			const actualParsedLintResults = linter.parseResults(
				tmpDir,
				Array.isArray(lintResults) ? lintResults[0] : lintResults,
			);
			expect(actualParsedLintResults).toEqual(parsedLintResults);
		});

		test(`${linter.name} returns correct auto-fix results`, () => {
			let actualFixResults = linter.lint(tmpDir, extensions, true);
			actualFixResults = normalizeDates(actualFixResults);
			if (Array.isArray(fixResults)) {
				expect(fixResults).toContain(actualFixResults);
			} else {
				expect(actualFixResults).toEqual(fixResults);
			}
		});

		test(`${linter.name} parses auto-fix results correctly`, () => {
			const actualParsedFixResults = linter.parseResults(
				tmpDir,
				Array.isArray(fixResults) ? fixResults[0] : fixResults,
			);
			expect(actualParsedFixResults).toEqual(parsedFixResults);
		});
	},
);
