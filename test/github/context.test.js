const { join } = require("path");

const {
	parseActionEnv,
	parseBranch,
	parseEnvFile,
	parseRepository,
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
		Object.keys(ENV).forEach(varName => delete process.env[varName]);
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
	test('works with "push" event', () => {
		expect(parseBranch("push", pushEvent)).toEqual(BRANCH);
	});

	test('works with "pull_request" event', () => {
		expect(parseBranch("pull_request", prOpenEvent)).toEqual(BRANCH);
		expect(parseBranch("pull_request", prSyncEvent)).toEqual(BRANCH);
	});

	test("throws error for unsupported event", () => {
		expect(() => parseBranch("other_event", pushEvent)).toThrow();
	});
});

describe("parseRepository()", () => {
	test('works with "push" event', () => {
		// Fork detection is not supported for "push" events
		expect(parseRepository("push", pushEvent)).toEqual({
			repoName: REPOSITORY,
			forkName: undefined,
			hasFork: false,
		});
	});

	test('works with "pull_request" event on repository without fork', () => {
		expect(parseRepository("pull_request", prOpenEvent)).toEqual({
			repoName: REPOSITORY,
			forkName: undefined,
			hasFork: false,
		});

		expect(parseRepository("pull_request", prSyncEvent)).toEqual({
			repoName: REPOSITORY,
			forkName: undefined,
			hasFork: false,
		});
	});

	test('works with "pull_request" event on repository with fork', () => {
		const prOpenEventMod = { ...prOpenEvent };
		prOpenEventMod.pull_request.head.repo.full_name = FORK_REPOSITORY;
		expect(parseRepository("pull_request", prOpenEventMod)).toEqual({
			repoName: REPOSITORY,
			forkName: FORK_REPOSITORY,
			hasFork: true,
		});

		const prSyncEventMod = { ...prSyncEvent };
		prSyncEventMod.pull_request.head.repo.full_name = FORK_REPOSITORY;
		expect(parseRepository("pull_request", prSyncEventMod)).toEqual({
			repoName: REPOSITORY,
			forkName: FORK_REPOSITORY,
			hasFork: true,
		});
	});
});
