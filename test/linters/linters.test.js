const { join } = require("path");

const { copy } = require("fs-extra");

const { normalizeDates, testProjectsDir, tmpDir } = require("../test-utils");
const blackParams = require("./params/black");
const eslintParams = require("./params/eslint");
const eslintTypescriptParams = require("./params/eslint-typescript");
const flake8Params = require("./params/flake8");
const gofmtParams = require("./params/gofmt");
const golintParams = require("./params/golint");
const mypyParams = require("./params/mypy");
const prettierParams = require("./params/prettier");
const ruboCopParams = require("./params/rubocop");
const stylelintParams = require("./params/stylelint");
const swiftformatParams = require("./params/swiftformat");
const swiftlintParams = require("./params/swiftlint");
const xoParams = require("./params/xo");

const linterParams = [
	blackParams,
	eslintParams,
	eslintTypescriptParams,
	flake8Params,
	gofmtParams,
	golintParams,
	mypyParams,
	prettierParams,
	ruboCopParams,
	stylelintParams,
	xoParams,
];

// Only run Swift tests on macOS
if (process.platform === "darwin") {
	linterParams.push(swiftformatParams, swiftlintParams);
}

// Copy linter test projects into temporary directory
beforeAll(async () => {
	jest.setTimeout(30000);
	await copy(testProjectsDir, tmpDir);
});

// Test lint and auto-fix modes
describe.each([
	["lint", false],
	["auto-fix", true],
])("%s", (lintMode, autoFix) => {
	// Test all linters
	describe.each(linterParams)(
		"%s",
		(projectName, linter, extensions, getLintParams, getFixParams) => {
			const projectTmpDir = join(tmpDir, projectName);
			const expected = autoFix ? getFixParams(projectTmpDir) : getLintParams(projectTmpDir);

			beforeAll(async () => {
				await linter.verifySetup(projectTmpDir);
			});

			// Test `lint` function
			test(`${linter.name} returns expected ${lintMode} output`, () => {
				const cmdOutput = linter.lint(projectTmpDir, extensions, "", autoFix);

				// Exit code
				expect(cmdOutput.status).toEqual(expected.cmdOutput.status);

				// stdout
				const stdout = normalizeDates(cmdOutput.stdout);
				if ("stdoutParts" in expected.cmdOutput) {
					expected.cmdOutput.stdoutParts.forEach(stdoutPart =>
						expect(stdout).toEqual(expect.stringContaining(stdoutPart)),
					);
				} else if ("stdout" in expected.cmdOutput) {
					expect(stdout).toEqual(expected.cmdOutput.stdout);
				}

				// stderr
				const stderr = normalizeDates(cmdOutput.stderr);
				if ("stderrParts" in expected.cmdOutput) {
					expected.cmdOutput.stderrParts.forEach(stderrParts =>
						expect(stderr).toEqual(expect.stringContaining(stderrParts)),
					);
				} else if ("stderr" in expected.cmdOutput) {
					expect(stderr).toEqual(expected.cmdOutput.stderr);
				}
			});

			// Test `parseOutput` function
			test(`${linter.name} parses ${lintMode} output correctly`, () => {
				const lintResult = linter.parseOutput(projectTmpDir, expected.cmdOutput);
				expect(lintResult).toEqual(expected.lintResult);
			});
		},
	);
});
