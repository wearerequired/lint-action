const { join } = require("path");

const { copy, remove } = require("fs-extra");

const { normalizeDates, normalizePaths, createTmpDir } = require("../test-utils");
const blackParams = require("./params/black");
const clippyParams = require("./params/clippy");
const eslintParams = require("./params/eslint");
const eslintTypescriptParams = require("./params/eslint-typescript");
const flake8Params = require("./params/flake8");
const gofmtParams = require("./params/gofmt");
const golintParams = require("./params/golint");
const mypyParams = require("./params/mypy");
const phpCodeSnifferParams = require("./params/php-codesniffer");
const prettierParams = require("./params/prettier");
const ruboCopParams = require("./params/rubocop");
const stylelintParams = require("./params/stylelint");
const swiftFormatLockwood = require("./params/swift-format-lockwood");
// const swiftFormatOfficial = require("./params/swift-format-official");
const swiftlintParams = require("./params/swiftlint");
const xoParams = require("./params/xo");

const linterParams = [
	blackParams,
	clippyParams,
	eslintParams,
	eslintTypescriptParams,
	flake8Params,
	gofmtParams,
	golintParams,
	mypyParams,
	phpCodeSnifferParams,
	prettierParams,
	ruboCopParams,
	stylelintParams,
	xoParams,
];
if (process.platform === "linux") {
	// Temporarily disabled because swift-format 0.50300.0 no longer returns a proper exit code, yet
	// returns the errors in STDERR.
	// linterParams.push(swiftFormatOfficial);
}
if (process.platform === "darwin") {
	linterParams.push(swiftFormatLockwood, swiftlintParams);
}

const tmpDir = createTmpDir();
jest.setTimeout(70000);

// Copy linter test projects into temporary directory
beforeAll(async () => {
	await copy(join(__dirname, "projects"), tmpDir);
});

afterAll(async () => {
	await remove(tmpDir);
});

// Test all linters
describe.each(linterParams)(
	"%s",
	(projectName, linter, commandPrefix, extensions, getLintParams, getFixParams) => {
		const projectTmpDir = join(tmpDir, projectName);
		beforeAll(async () => {
			await expect(linter.verifySetup(projectTmpDir, commandPrefix)).resolves.toEqual(undefined);
		});

		// Test lint and auto-fix modes
		describe.each([
			["lint", false],
			["auto-fix", true],
		])("%s", (lintMode, autoFix) => {
			const expected = autoFix ? getFixParams(projectTmpDir) : getLintParams(projectTmpDir);

			// Test `lint` function
			test(`${linter.name} returns expected ${lintMode} output`, () => {
				const cmdOutput = linter.lint(projectTmpDir, extensions, "", autoFix, commandPrefix);

				// Exit code
				expect(cmdOutput.status).toEqual(expected.cmdOutput.status);

				// stdout
				let stdout = normalizeDates(cmdOutput.stdout);
				stdout = normalizePaths(stdout, tmpDir);
				if ("stdoutParts" in expected.cmdOutput) {
					expected.cmdOutput.stdoutParts.forEach((stdoutPart) =>
						expect(stdout).toEqual(expect.stringContaining(stdoutPart)),
					);
				} else if ("stdout" in expected.cmdOutput) {
					expect(stdout).toEqual(expected.cmdOutput.stdout);
				}

				// stderr
				let stderr = normalizeDates(cmdOutput.stderr);
				stderr = normalizePaths(stderr, tmpDir);
				if ("stderrParts" in expected.cmdOutput) {
					expected.cmdOutput.stderrParts.forEach((stderrParts) =>
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
		});
	},
);
