const { createCheck } = require("../../src/github/api");
const {
	EVENT_NAME,
	EVENT_PATH,
	FORK_REPOSITORY,
	REPOSITORY,
	REPOSITORY_DIR,
	TOKEN,
	USERNAME,
} = require("./test-constants");

jest.mock("../../src/utils/request", () =>
	// eslint-disable-next-line global-require
	jest.fn().mockReturnValue(require("./api-responses/check-runs.json")),
);

describe("createCheck()", () => {
	const LINT_RESULT = {
		isSuccess: true,
		warning: [],
		error: [],
	};
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

	test("mocked request should be successful", async () => {
		await expect(
			createCheck("check-name", "sha", context, LINT_RESULT, "summary"),
		).resolves.toEqual(undefined);
	});

	test("mocked request should fail when no lint results are provided", async () => {
		await expect(createCheck("check-name", "sha", context, null, "summary")).rejects.toEqual(
			expect.any(Error),
		);
	});
});
