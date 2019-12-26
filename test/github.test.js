const { createCheck, getGithubInfo } = require("../src/github");

const USERNAME = "testuser";
const REPOSITORY = "test-repo";

const GITHUB_EVENT_NAME = "push";
const GITHUB_SHA = "test-sha";
const GITHUB_REPOSITORY = `${USERNAME}/${REPOSITORY}`;
const GITHUB_WORKSPACE = "/path/to/cloned/repo";
const INPUT_GITHUB_TOKEN = "test-token";

const ENV = {
	GITHUB_EVENT_NAME,
	GITHUB_SHA,
	GITHUB_REPOSITORY,
	GITHUB_WORKSPACE,
	INPUT_GITHUB_TOKEN,
};

const github = {
	eventName: GITHUB_EVENT_NAME,
	repository: REPOSITORY,
	sha: GITHUB_SHA,
	token: INPUT_GITHUB_TOKEN,
	username: USERNAME,
	workspace: GITHUB_WORKSPACE,
};

jest.mock("../src/utils/request");

describe("getGithubInfo()", () => {
	// Add GitHub environment variables
	beforeEach(() => {
		process.env = {
			...process.env,
			...ENV,
		};
	});

	// Remove GitHub environment variables
	afterEach(() => {
		Object.keys(ENV).forEach(varName => delete process.env[varName]);
	});

	test("should return correct data", () => {
		const githubReceived = getGithubInfo();
		expect(githubReceived).toMatchObject(github);
	});
});

describe("createCheck()", () => {
	const RESULTS = [[], [], []];

	test("mocked request should be successful", async () => {
		await expect(createCheck("check-name", github, RESULTS)).resolves.toEqual(undefined);
	});

	test("mocked request should fail without results", async () => {
		await expect(createCheck("check-name", github, null)).rejects.toEqual(expect.any(Error));
	});
});
