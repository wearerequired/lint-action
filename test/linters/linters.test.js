const { join } = require("path");

const { copySync, removeSync } = require("fs-extra");

const { normalizeDates } = require("../utils");
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
];

// Only run Swift tests on macOS
if (process.platform === "darwin") {
	linterParams.push(swiftformatParams, swiftlintParams);
}

// Test lint and auto-fix modes
describe.each([
	["lint", false],
	["auto-fix", true],
])("%s", (lintMode, autoFix) => {
	// Test all linters
	describe.each(linterParams)(
		"%s",
		(projectName, linter, extensions, getLintParams, getFixParams) => {
			const projectDir = join(__dirname, "projects", projectName);
			const tmpDir = join(__dirname, "..", "tmp", projectName);
			const expected = autoFix ? getFixParams(tmpDir) : getLintParams(tmpDir);

			beforeAll(async () => {
				// Move test project into temporary directory (where files can be modified by the linters)
				copySync(projectDir, tmpDir);
				await linter.verifySetup(tmpDir);
			});

			afterAll(() => {
				// Remove temporary directory after test completion
				removeSync(tmpDir);
			});

			// Test `lint` function
			test(`${linter.name} returns expected ${lintMode} output`, () => {
				const cmdOutput = linter.lint(tmpDir, extensions, "", autoFix);

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
				const lintResult = linter.parseOutput(tmpDir, expected.cmdOutput);
				expect(lintResult).toEqual(expected.lintResult);
			});
		},
	);
});
