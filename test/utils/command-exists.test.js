const commandExists = require("../../src/utils/command-exists");

// `command-exists` shells out to `where`/`command -v`, which can be slow to spawn on a loaded
// (Windows) CI runner, so the default 5s timeout is occasionally exceeded
jest.setTimeout(15000);

describe("commandExists()", () => {
	test("should return `true` for existing command", async () => {
		// `cat` is not guaranteed to exist on Windows; `cmd` (the command interpreter) always is
		const existingCommand = process.platform === "win32" ? "cmd" : "cat";
		await expect(commandExists(existingCommand)).resolves.toEqual(true);
	});

	test("should return `false` for non-existent command", async () => {
		await expect(commandExists("nonexistentcommand")).resolves.toEqual(false);
	});
});
