const { join } = require("path");
const { createCheck, getContext } = require("../../src/github");
const prOpenEvent = require("./events/pull-request-open.json");
const prSyncEvent = require("./events/pull-request-sync.json");
const pushEvent = require("./events/push.json");

const USERNAME = "test-user";
const REPOSITORY = "test-repo";
const BRANCH = "test-branch";

// Environment variables provided by GitHub Actions
const GITHUB_ACTOR = USERNAME;
const GITHUB_REPOSITORY = `${USERNAME}/${REPOSITORY}`;
const GITHUB_WORKSPACE = "/path/to/cloned/repo";
const INPUT_GITHUB_TOKEN = "test-token";
const ENV = {
	GITHUB_ACTOR,
	GITHUB_REPOSITORY,
	GITHUB_WORKSPACE,
	INPUT_GITHUB_TOKEN,
};

const expectedContext = {
	actor: GITHUB_ACTOR,
	branch: BRANCH,
	repository: REPOSITORY,
	token: INPUT_GITHUB_TOKEN,
	username: USERNAME,
	workspace: GITHUB_WORKSPACE,
};

const prOpenEventPath = join(__dirname, "events", "pull-request-open.json");
const prSyncEventPath = join(__dirname, "events", "pull-request-sync.json");
const pushEventPath = join(__dirname, "events", "push.json");

jest.mock("../../src/utils/request");

describe("getContext()", () => {
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

	// Test `getContext` function for different event types
	test.each([
		["push", "push", pushEventPath, pushEvent],
		["PR open", "pull_request", prOpenEventPath, prOpenEvent],
		["PR sync", "pull_request", prSyncEventPath, prSyncEvent],
	])("should return correct context for %s event", (eventDesc, eventName, eventPath, event) => {
		process.env.GITHUB_EVENT_NAME = eventName;
		process.env.GITHUB_EVENT_PATH = eventPath;
		const githubReceived = getContext();
		expect(githubReceived).toMatchObject({
			...expectedContext,
			event,
			eventName,
		});
	});
});

describe("createCheck()", () => {
	const LINT_RESULT = {
		isSuccess: true,
		warning: [],
		error: [],
	};
	const context = {
		...expectedContext,
		event: {},
		eventName: "push",
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
