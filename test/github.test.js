const { getGithubInfo } = require("../src/github");

describe("getGithubInfo()", () => {
	const GITHUB_EVENT_NAME = "push";
	const GITHUB_SHA = "test-sha";
	const USERNAME = "testuser";
	const REPOSITORY = "test-repo";
	const GITHUB_REPOSITORY = `${USERNAME}/${REPOSITORY}`;
	const GITHUB_WORKSPACE = "/path/to/cloned/repo";
	const INPUT_GITHUB_TOKEN = "test-token";

	// Add GitHub environment variables
	beforeEach(() => {
		process.env = {
			...process.env,
			GITHUB_EVENT_NAME,
			GITHUB_SHA,
			GITHUB_REPOSITORY,
			GITHUB_WORKSPACE,
			INPUT_GITHUB_TOKEN,
		};
	});

	// Remove GitHub environment variables
	afterEach(() => {
		delete process.env.GITHUB_EVENT_NAME;
		delete process.env.GITHUB_SHA;
		delete process.env.GITHUB_REPOSITORY;
		delete process.env.GITHUB_WORKSPACE;
		delete process.env.INPUT_GITHUB_TOKEN;
	});

	test("should return correct data", () => {
		const github = getGithubInfo();
		expect(github).toMatchObject({
			eventName: GITHUB_EVENT_NAME,
			repository: REPOSITORY,
			sha: GITHUB_SHA,
			token: INPUT_GITHUB_TOKEN,
			username: USERNAME,
			workspace: GITHUB_WORKSPACE,
		});
	});
});
