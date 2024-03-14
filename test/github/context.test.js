const { join } = require("path");

const {
	parseActionEnv,
	parseBranch,
	parseEnvFile,
	parseRepository,
	parsePullRequest,
} = require("../../src/github/context");
const prOpenEvent = require("./events/pull-request-open.json");
const prSyncEvent = require("./events/pull-request-sync.json");
const pushEvent = require("./events/push.json");
const {
	BRANCH,
	EVENT_NAME,
	EVENT_PATH,
	FORK_REPOSITORY,
	REPOSITORY,
	REPOSITORY_DIR,
	TOKEN,
	USERNAME,
} = require("./test-constants");

const invalidEventPath = "/path/to/invalid/event.json";
const prOpenEventPath = join(__dirname, "events", "pull-request-open.json");
const prSyncEventPath = join(__dirname, "events", "pull-request-sync.json");
const pushEventPath = join(__dirname, "events", "push.json");

describe("parseActionEnv()", () => {
	// Environment variables provided by GitHub Actions
	const ENV = {
		GITHUB_ACTOR: USERNAME,
		GITHUB_EVENT_NAME: EVENT_NAME,
		GITHUB_EVENT_PATH: EVENT_PATH,
		GITHUB_WORKSPACE: REPOSITORY_DIR,
		INPUT_GITHUB_TOKEN: TOKEN,
	};

	// Expected result from parsing the environment variables
	const EXPECTED = {
		actor: USERNAME,
		eventName: EVENT_NAME,
		eventPath: EVENT_PATH,
		token: TOKEN,
		workspace: REPOSITORY_DIR,
	};

	// Add GitHub environment variables
	beforeEach(() => {
		process.env = {
			...process.env,
			...ENV,
		};
	});

	// Remove GitHub environment variables
	afterEach(() => {
		Object.keys(ENV).forEach((varName) => delete process.env[varName]);
	});

	test("works when token is provided", () => {
		expect(parseActionEnv()).toEqual(EXPECTED);
	});

	test("throws error when token is missing", () => {
		delete process.env.INPUT_GITHUB_TOKEN;
		expect(() => parseActionEnv()).toThrow();
		process.env.INPUT_GITHUB_TOKEN = TOKEN;
	});
});

describe("parseEnvFile()", () => {
	test('parses "push" event successfully', () => {
		expect(parseEnvFile(pushEventPath)).toEqual(pushEvent);
	});

	test('parses "pull_request" ("opened") event successfully', () => {
		expect(parseEnvFile(prOpenEventPath)).toEqual(prOpenEvent);
	});

	test('parses "pull_request" ("synchronize") event successfully', () => {
		expect(parseEnvFile(prSyncEventPath)).toEqual(prSyncEvent);
	});

	test("throws error for invalid `event.json` path", () => {
		expect(() => parseEnvFile(invalidEventPath)).toThrow();
	});
});

describe("parseBranch()", () => {
	test('works with "push" event', async () => {
		const pr = await parsePullRequest("push", pushEvent);
		expect(parseBranch("push", pushEvent, pr)).toEqual(BRANCH);
	});

	test('works with "pull_request" event', async () => {
		const prOpen = await parsePullRequest("pull_request", prOpenEvent);
		const prSync = await parsePullRequest("pull_request", prSyncEvent);
		expect(parseBranch("pull_request", prOpenEvent, prOpen)).toEqual(BRANCH);
		expect(parseBranch("pull_request", prSyncEvent, prSync)).toEqual(BRANCH);
	});

	test("throws error for unsupported event", () => {
		expect(() => parseBranch("other_event", pushEvent)).toThrow();
	});
});

describe("parseRepository()", () => {
	test('works with "push" event', async () => {
		// Fork detection is not supported for "push" events
		const pr = await parsePullRequest("push", pushEvent);
		expect(parseRepository("push", pushEvent, pr)).toEqual({
			repoName: REPOSITORY,
			cloneUrl: `https://github.com/${REPOSITORY}.git`,
			forkName: undefined,
			forkCloneUrl: undefined,
			hasFork: false,
		});
	});

	test('works with "pull_request" event on repository without fork', async () => {
		const prOpen = await parsePullRequest("pull_request", prOpenEvent);
		const prSync = await parsePullRequest("pull_request", prSyncEvent);
		expect(parseRepository("pull_request", prOpenEvent, prOpen)).toEqual({
			repoName: REPOSITORY,
			cloneUrl: `https://github.com/${REPOSITORY}.git`,
			forkName: undefined,
			forkCloneUrl: undefined,
			hasFork: false,
		});

		expect(parseRepository("pull_request", prSyncEvent, prSync)).toEqual({
			repoName: REPOSITORY,
			cloneUrl: `https://github.com/${REPOSITORY}.git`,
			forkName: undefined,
			forkCloneUrl: undefined,
			hasFork: false,
		});
	});

	test('works with "pull_request" event on repository with fork', async () => {
		const prOpenEventMod = { ...prOpenEvent };
		prOpenEventMod.pull_request.head.repo.full_name = FORK_REPOSITORY;
		prOpenEventMod.pull_request.head.repo.clone_url = `https://github.com/${FORK_REPOSITORY}.git`;
		const prOpenMod = await parsePullRequest("pull_request", prOpenEventMod);
		expect(parseRepository("pull_request", prOpenEventMod, prOpenMod)).toEqual({
			repoName: REPOSITORY,
			cloneUrl: `https://github.com/${REPOSITORY}.git`,
			forkName: FORK_REPOSITORY,
			forkCloneUrl: `https://github.com/${FORK_REPOSITORY}.git`,
			hasFork: true,
		});

		const prSyncEventMod = { ...prSyncEvent };
		prSyncEventMod.pull_request.head.repo.full_name = FORK_REPOSITORY;
		prSyncEventMod.pull_request.head.repo.clone_url = `https://github.com/${FORK_REPOSITORY}.git`;
		const prSyncMod = await parsePullRequest("pull_request", prOpenEventMod);
		expect(parseRepository("pull_request", prSyncEventMod, prSyncMod)).toEqual({
			repoName: REPOSITORY,
			cloneUrl: `https://github.com/${REPOSITORY}.git`,
			forkName: FORK_REPOSITORY,
			forkCloneUrl: `https://github.com/${FORK_REPOSITORY}.git`,
			hasFork: true,
		});
	});
});
