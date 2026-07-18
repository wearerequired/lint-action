const { normalizeLintResultPaths } = require("../../src/utils/lint-result");

/**
 * Builds a lint result with the given error and warning paths
 * @param {string[]} errorPaths - Paths for the error entries
 * @param {string[]} warningPaths - Paths for the warning entries
 * @returns {object} - Lint result
 */
function lintResult(errorPaths, warningPaths = []) {
	const toEntry = (path) => ({ path, firstLine: 1, lastLine: 1, message: "msg" });
	return {
		isSuccess: false,
		error: errorPaths.map(toEntry),
		warning: warningPaths.map(toEntry),
	};
}

describe("normalizeLintResultPaths()", () => {
	test("leaves repo-root paths unchanged when the linter runs in the root", () => {
		const result = normalizeLintResultPaths(lintResult(["file.py"]), ".");
		expect(result.error[0].path).toEqual("file.py");
	});

	test("prepends the linter directory so paths are relative to the repository root (#94)", () => {
		const result = normalizeLintResultPaths(lintResult(["file.py"]), "subdir");
		expect(result.error[0].path).toEqual("subdir/file.py");
	});

	test("handles nested linter directories", () => {
		const result = normalizeLintResultPaths(lintResult(["a/file.py"]), "src/app");
		expect(result.error[0].path).toEqual("src/app/a/file.py");
	});

	test("converts backslash paths to forward slashes (#608)", () => {
		const result = normalizeLintResultPaths(lintResult(["sub\\file.cs"]), ".");
		expect(result.error[0].path).toEqual("sub/file.cs");
	});

	test("combines the directory prefix and slash conversion", () => {
		const result = normalizeLintResultPaths(lintResult(["sub\\file.cs"]), "src\\app");
		expect(result.error[0].path).toEqual("src/app/sub/file.cs");
	});

	test("does not produce double slashes for a directory with a trailing slash", () => {
		const result = normalizeLintResultPaths(lintResult(["file.py"]), "subdir/");
		expect(result.error[0].path).toEqual("subdir/file.py");
	});

	test("strips a leading ./ from the directory", () => {
		const result = normalizeLintResultPaths(lintResult(["file.py"]), "./subdir");
		expect(result.error[0].path).toEqual("subdir/file.py");
	});

	test("rewrites both error and warning paths", () => {
		const result = normalizeLintResultPaths(lintResult(["e.py"], ["w.py"]), "dir");
		expect(result.error[0].path).toEqual("dir/e.py");
		expect(result.warning[0].path).toEqual("dir/w.py");
	});
});
