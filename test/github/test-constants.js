const USERNAME = "test-user";
const REPOSITORY_NAME = "test-repo";
const REPOSITORY = `${USERNAME}/${REPOSITORY_NAME}`;

const FORK_USERNAME = "fork-user";
const FORK_REPOSITORY_NAME = `${REPOSITORY_NAME}-fork`;
const FORK_REPOSITORY = `${FORK_USERNAME}/${FORK_REPOSITORY_NAME}`;

const BRANCH = "test-branch";
const REPOSITORY_DIR = "/path/to/cloned/repo";
const TOKEN = "test-token";

const EVENT_NAME = "push";
const EVENT_PATH = "/path/to/event.json";

module.exports = {
	USERNAME,
	REPOSITORY_NAME,
	REPOSITORY,
	FORK_USERNAME,
	FORK_REPOSITORY_NAME,
	FORK_REPOSITORY,
	BRANCH,
	REPOSITORY_DIR,
	TOKEN,
	EVENT_NAME,
	EVENT_PATH,
};
