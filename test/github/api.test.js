const { createCheck } = require("../../src/github/api");
const request = require("../../src/utils/request");
const {
	EVENT_NAME,
	EVENT_PATH,
	FORK_REPOSITORY,
	REPOSITORY,
	REPOSITORY_DIR,
	TOKEN,
	USERNAME,
} = require("./test-constants");

jest.mock("../../src/utils/request");

describe("createCheck()", () => {
	const context = {
		actor: USERNAME,
		event: {},
		eventName: EVENT_NAME,
		eventPath: EVENT_PATH,
		repository: {
			repoName: REPOSITORY,
			forkName: FORK_REPOSITORY,
			hasFork: false,
		},
		token: TOKEN,
		workspace: REPOSITORY_DIR,
	};

	/**
	 * Builds a lint result with the given number of errors
	 * @param {number} errorCount - Number of errors to include
	 * @returns {object} - Lint result
	 */
	function lintResultWithErrors(errorCount) {
		return {
			isSuccess: errorCount === 0,
			warning: [],
			error: Array.from({ length: errorCount }, (_, i) => ({
				path: `file${i}.js`,
				firstLine: 1,
				lastLine: 1,
				message: `Error ${i}`,
			})),
		};
	}

	beforeEach(() => {
		request.mockReset();
		request.mockResolvedValue({ data: { id: 123456789 } });
	});

	test("mocked request should be successful", async () => {
		await expect(
			createCheck("check-name", "sha", context, lintResultWithErrors(0), false, "summary"),
		).resolves.toEqual(undefined);
	});

	test("mocked request should fail when no lint results are provided", async () => {
		await expect(createCheck("check-name", "sha", context, null, false, "summary")).rejects.toEqual(
			expect.any(Error),
		);
	});

	test("creates a single check run when there are no annotations", async () => {
		await createCheck("check-name", "sha", context, lintResultWithErrors(0), false, "summary");
		expect(request).toHaveBeenCalledTimes(1);
		expect(request.mock.calls[0][1].method).toEqual("POST");
	});

	test("batches more than 50 annotations into create and update requests", async () => {
		await createCheck("check-name", "sha", context, lintResultWithErrors(120), false, "summary");

		// 120 annotations -> 1 POST (50) + 2 PATCH (50 + 20)
		expect(request).toHaveBeenCalledTimes(3);

		const methods = request.mock.calls.map((call) => call[1].method);
		expect(methods).toEqual(["POST", "PATCH", "PATCH"]);

		// No request exceeds the 50-annotation limit and all annotations are sent
		const annotationCounts = request.mock.calls.map(
			(call) => call[1].body.output.annotations.length,
		);
		expect(annotationCounts).toEqual([50, 50, 20]);
		expect(annotationCounts.reduce((sum, count) => sum + count, 0)).toEqual(120);

		// Updates target the check run created by the first request
		const [createUrl] = request.mock.calls[0];
		const [updateUrl] = request.mock.calls[1];
		expect(updateUrl).toEqual(`${createUrl}/123456789`);
	});
});
